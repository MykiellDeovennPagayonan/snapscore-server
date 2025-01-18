import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { ChatCompletionTool } from 'openai/resources/index.mjs';

import * as dotenv from 'dotenv';

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

  async rateEssay(filename: string): Promise<number> {
    try {
      const imageBase64 = await this.convertImageToBase64(filename);

      if (!imageBase64) {
        throw new BadRequestException('Failed to convert image to Base64');
      }

      console.log(imageBase64);

      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `Check the indentification answers, the answer sheet is as follows:
          1.
            `,
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
        const data =
          response.choices[0].message.tool_calls[0].function.arguments;
        const parsedData = JSON.parse(data);
        return parsedData;
      } else {
        throw new BadRequestException('Failed to rate the essay');
      }
    } catch (error) {
      throw error;
    }
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
                description: "The student's provided answer for the item.",
              },
              isCorrect: {
                type: 'boolean',
                description:
                  "Indicates if the student's answer matches the correct answer.",
              },
            },
            required: [
              'itemNumber',
              'correctAnswer',
              'studentAnswer',
              'isCorrect',
            ],
          },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [checkIdentification];
