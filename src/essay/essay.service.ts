import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { ChatCompletionTool } from 'openai/resources/index.mjs';
import { prisma } from '../prisma';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

@Injectable()
export class EssayService {
  private readonly logger = new Logger(EssayService.name);

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
        `Failed to convert image: ${error.message}`,
      );
    }
  }

  async rateEssay(
    filename: string,
    assessmentId: string,
    essayCriteria: {
      criteria: string;
      maxScore: number;
      rubrics: { score: string; description: string };
    }[],
  ): Promise<any> {
    try {
      const imageBase64 = await this.convertImageToBase64(filename);
      if (!imageBase64) {
        throw new BadRequestException('Failed to convert image to Base64');
      }

      const messages: ChatCompletionTool[] = [
        {
          role: 'system',
          content: `Evaluate the essay based on the following criteria. Return scores for each criterion along with a total score. Also identify the student's name.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: `Criteria: ${JSON.stringify(essayCriteria)}`,
            },
          ],
        },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 1,
        max_tokens: 5000,
        tools: functionCallingTools,
      });

      if (
        response.choices[0].message.tool_calls &&
        response.choices[0].message.tool_calls[0].function.name === 'rate_essay'
      ) {
        const data =
          response.choices[0].message.tool_calls[0].function.arguments;
        const parsedData = JSON.parse(data);
        let totalScore = 0;
        const studentName = parsedData.studentName;

        console.log(parsedData.criteria[0]);
        console.log(parsedData.criteria[0].essayCriteriaResults);

        const questionResults = parsedData.criteria.map((criterion) => {
          totalScore += criterion.rating;
          return {
            questionId: assessmentId,
            score: criterion.rating,
            essayCriteriaResults: [
              {
                score: criterion.rating,
              },
            ],
          };
        });

        console.log(questionResults);
        console.log(questionResults[0].essayCriteriaResults);

        return this.addEssayResult({
          studentName,
          assessmentId,
          score: totalScore,
          questionResults,
        });
        // return 'hello';
      } else {
        throw new BadRequestException('Failed to rate the essay');
      }
    } catch (error) {
      throw new BadRequestException(`Error rating essay: ${error.message}`);
    }
  }

  async addEssayResult(data: {
    studentName: string;
    assessmentId: string;
    score: number;
    questionResults: {
      questionId: string;
      answer: string;
      score: number;
      essayCriteriaResults: {
        score: number;
      }[];
    }[];
  }) {
    return prisma.essayResult.create({
      data: {
        studentName: data.studentName,
        assessmentId: data.assessmentId,
        score: data.score,
        questionResults: {
          create: data.questionResults.map((result) => ({
            score: result.score,
            answer: result.answer,
            essayCriteriaResults: {
              create: result.essayCriteriaResults.map((criteriaResult) => ({
                score: criteriaResult.score,
              })),
            },
          })),
        },
      },
      include: {
        questionResults: {
          include: {
            essayCriteriaResults: true,
          },
        },
      },
    });
  }
}

const rateEssay: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'rate_essay',
    description:
      'Use this function to evaluate an essay based on multiple criteria.',
    parameters: {
      type: 'object',
      properties: {
        essayContent: {
          type: 'string',
          description: 'The full text of the essay to be evaluated.',
        },
        studentName: {
          type: 'string',
          description:
            'Name of the student who wrote the essay. If not indicated, put "No name".',
        },
        criteria: {
          type: 'array',
          description: 'Array of criteria to rate the essay on.',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the evaluation criterion.',
              },
              rating: {
                type: 'number',
                description: 'Rating for this criterion.',
              },
              maxRating: {
                type: 'number',
                description: 'Maximum possible rating for this criterion.',
              },
            },
            required: ['name', 'rating', 'maxRating'],
          },
        },
      },
      required: ['essayContent', 'criteria', 'studentName'],
      additionalProperties: false,
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [rateEssay];
