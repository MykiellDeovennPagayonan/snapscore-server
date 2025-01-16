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
export class EssayService {
  private readonly logger = new Logger(EssayService.name);

  async convertImageToBase64(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'uploads', filename); // ✅ Fixed path to root
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
          content: `Rate the essay with the following criteria:
          
          idea: 20 points
          coherence: 20 points
          structure: 20 points
          grammar: 20 points
          vocabulary: 20 points
          `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
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
        response.choices[0].message.tool_calls[0].function.name === 'rate_essay'
      ) {
        const data =
          response.choices[0].message.tool_calls[0].function.arguments;
        const parsedData = JSON.parse(data);
        let totalRating = 0;
        parsedData.criteria.map((criterion) => {
          totalRating += criterion.rating;
        });
        return totalRating;
      } else {
        throw new BadRequestException('Failed to rate the essay');
      }
    } catch (error) {
      throw error;
    }
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
                description: 'rating for this criterion.',
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
      required: ['essayContent', 'criteria'],
      additionalProperties: false,
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [rateEssay];
