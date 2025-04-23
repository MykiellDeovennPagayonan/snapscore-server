import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { ChatCompletionTool } from 'openai/resources/index.mjs';
import * as dotenv from 'dotenv';
import { prisma } from 'src/prisma';
import { UploadService } from 'src/upload/upload.service';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
});

@Injectable()
export class IdentificationService {
  private readonly logger = new Logger(IdentificationService.name);

  constructor(private readonly uploadService: UploadService) {}

  async convertImageToBase64(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'uploads', filename);
    try {
      await fs.access(filePath);
      this.logger.log(`Reading file: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      await fs.unlink(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
      return fileBuffer.toString('base64');
    } catch (error) {
      this.logger.error(`Error processing file ${filename}:`, error);
      throw new BadRequestException(
        `Failed to convert image to Base64: ${error.message}`,
      );
    }
  }

  async processIdentification(
    assessmentId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      console.log('Step 1: Finding Assessment Data');
      const assessment = await prisma.identificationAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          identificationQuestions: {
            orderBy: {
              number: 'asc',
            },
          },
        },
      });

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      console.log('Assessment', assessment);

      console.log('Step 2: Saving Image');
      // 2. Upload the image and run the AI analysis concurrently.
      const [uploadResult, aiResponse] = await Promise.all([
        this.uploadService.uploadFile(
          `identification/${assessmentId}/${Date.now()}`,
          file,
        ),
        this.getAIAnalysis(
          Buffer.from(file.buffer).toString('base64'),
          assessment.identificationQuestions,
        ),
      ]);

      console.log('Step 5: Save the Results');
      // 3. Save the results linking the image URL and AI results.
      const result = await prisma.identificationResult.create({
        data: {
          studentName: aiResponse.studentName,
          assessmentId: assessmentId,
          paperImage: uploadResult.url, // Store the S3 URL.
          questionResults: {
            create: aiResponse.items.map((item) => ({
              number: item.itemNumber,
              isCorrect: item.isCorrect,
              answer: item.studentAnswer,
              // Map the item number to the question.
              questionId:
                assessment.identificationQuestions[item.itemNumber - 1].id,
            })),
          },
        },
        include: {
          questionResults: true,
        },
      });

      console.log('Result', result);
      return result;
    } catch (error) {
      this.logger.error(`Error processing identification: ${error.message}`);
      throw error;
    }
  }

  async getAIAnalysis(
    imageBase64: string,
    questions: {
      id: string;
      number: number;
      assessmentId: string;
      createdAt: Date;
      updatedAt: Date;
      correctAnswer: string;
    }[],
  ): Promise<any> {
    const expectedItems = questions.length;

    let columnInfo: string;
    if (expectedItems === 15) {
      columnInfo =
        'Note: The answer sheet is split into two columns. The left column is expected to contain the first half of the answers and the right column the remainder.';
    } else if (expectedItems === 10) {
      columnInfo =
        'Note: The answer sheet may be split into two columns or be in a single column.';
    } else {
      columnInfo = 'The answer sheet is a single column layout.';
    }

    // Build a list of correct answers.
    const correctAnswersList = questions
      .map((q) => `${q.number}. ${q.correctAnswer}`)
      .join('\n');

    // Create system message with explicit instructions.
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI that checks an identification test. The test has ${expectedItems} items. ${columnInfo}
The correct answers are as follows:
${correctAnswersList}

Please parse the answer sheet image and capture the student's answers in order from top-left to bottom-left and then top-right to bottom-right if the sheet is multi-column.
If an item is unclear, mark it for manual checking (manualCheck: true) and set a lower confidence score.

Always return your results using the check_identification function.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

    // Call the chat completion endpoint with our function calling configuration.
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 15010,
      tools: functionCallingTools,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Check if the AI returned a valid tool call with function name check_identification.
    if (
      response.choices[0].message.tool_calls &&
      response.choices[0].message.tool_calls[0].function.name ===
        'check_identification'
    ) {
      const data = JSON.parse(
        response.choices[0].message.tool_calls[0].function.arguments,
      );
      console.log('AI Analysis Data:', data);
      return data;
    }

    throw new BadRequestException('Failed to analyze the identification test');
  }
}

const checkIdentification: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'check_identification',
    description:
      'Use this function to check identification answers by comparing student answers with correct answers. Only case differences may be ignored, but different terms and common abbreviations should be marked incorrect',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description:
            'Name of the student who filled in the test. If not indicated put "No name".',
        },
        items: {
          type: 'array',
          description:
            'Array of identification items to check student answers.',
          items: {
            type: 'object',
            properties: {
              itemNumber: {
                type: 'number',
                description:
                  'The item number in the identification test as it appears on the image. Make sure this is the same as the number in the correct answer list.',
              },
              correctAnswer: {
                type: 'string',
                description: 'The correct answer for the item.',
              },
              studentAnswer: {
                type: 'string',
                description:
                  "The student's provided answer for the item. Note: DO NOT TRY TO MATCH STUDENT ANSWER WITH CORRECT ANSWER JUST BECAUSE THEY LOOK SIMILAR OR IMAGE IS UNCLEAR. CAREFULLY IDENTIFY WHAT THE STUDENT HAS WRITTEN",
              },
              isCorrect: {
                type: 'boolean',
                description:
                  "Indicates if the student's answer matches the correct answer.",
              },
              manualCheck: {
                type: 'boolean',
                description:
                  'Indicates that the item needs manual checking as the AI is doubtful about the correctedness of the checking.',
              },
              confidence: {
                type: 'number',
                description:
                  'Confidence score (0-1) of the AI in its assessment.',
              },
            },
            required: [
              'itemNumber',
              'correctAnswer',
              'studentAnswer',
              'isCorrect',
              'manualCheck',
              'confidence',
            ],
          },
        },
        metadata: {
          type: 'object',
          description: 'Additional information about the assessment process',
          properties: {
            imageQuality: {
              type: 'string',
              enum: ['good', 'moderate', 'poor'],
              description: 'A quality assessment of the uploaded image',
            },
            processingTime: {
              type: 'number',
              description: 'Time taken to process the image in milliseconds',
            },
          },
          required: ['imageQuality'],
        },
      },
      required: ['items', 'studentName', 'metadata'],
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [checkIdentification];
