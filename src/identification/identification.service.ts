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
  constructor(private readonly uploadService: UploadService) {}

  async processIdentification(
    assessmentId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      // 1. Get the assessment and its questions from the database
      const assessment = await prisma.identificationAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          identificationQuestions: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!assessment) {
        throw new NotFoundException('Assessment not found');
      }

      // 2. Upload the image to S3
      // const uploadResult = await this.uploadService.uploadFile(
      //   `identification/${assessmentId}/${Date.now()}`,
      //   file,
      // );

      // 3. Get AI analysis of the image
      const imageBase64 = Buffer.from(file.buffer).toString('base64');
      const aiResponse = await this.getAIAnalysis(
        imageBase64,
        assessment.identificationQuestions,
      );

      // 4. Create the identification result with the image URL
      const result = await prisma.identificationResult.create({
        data: {
          studentName: aiResponse.studentName,
          assessmentId: assessmentId,
          // paperImage: uploadResult.url, // Store the S3 URL
          questionResults: {
            create: aiResponse.items.map((item) => ({
              isCorrect: item.isCorrect,
              answer: item.studentAnswer,
              questionId:
                assessment.identificationQuestions[item.itemNumber - 1].id,
            })),
          },
        },
        include: {
          questionResults: true,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error processing identification: ${error.message}`);
      throw error;
    }
  }

  async getAIAnalysis(imageBase64: string, questions: any[]): Promise<any> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI that will check the identification test. Check the identification answers against the provided correct answers. Always use the check_identification function. The answer sheet has ${questions.length} questions with the following correct answers:\n\n${questions.map((q, i) => `${i + 1}. ${q.correctAnswer}`).join('\n')}`,
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 1,
      max_tokens: 15010,
      tools: functionCallingTools,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (
      response.choices[0].message.tool_calls &&
      response.choices[0].message.tool_calls[0].function.name ===
        'check_identification'
    ) {
      const data = JSON.parse(
        response.choices[0].message.tool_calls[0].function.arguments,
      );
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
      'Use this function to check identification answers by comparing student answers with correct answers.',
    parameters: {
      type: 'object',
      properties: {
        studentName: {
          type: 'string',
          description:
            'Name of the student who wrote the essay. If not indicated put "No name"',
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
                description: 'The item number in the identification test.',
              },
              correctAnswer: {
                type: 'string',
                description: 'The correct answer for the item.',
              },
              studentAnswer: {
                type: 'string',
                description:
                  "The student's provided answer for the item. NOte: Do not be too strict because of bad hand writing",
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
          description: 'Additional information about the assessment',
          properties: {
            imageQuality: {
              type: 'string',
              enum: ['good', 'moderate', 'poor'],
              description: 'Quality assessment of the uploaded image',
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
