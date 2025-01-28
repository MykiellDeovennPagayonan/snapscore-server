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
          content: `Rate the essay using the following criteria and detailed scoring scale:

Idea (20 points)
3-5: The essay lacks a clear central idea; ideas are confusing or irrelevant.
7-10: The main idea is weakly developed and lacks originality or insight.
12-15: The main idea is clear but could be more original or engaging. Some supporting ideas are underdeveloped.
18-19: The main idea is strong, creative, and well-developed with relevant supporting points.
20: The essay presents a highly original, insightful idea fully developed with compelling support.

Coherence (20 points)
3-5: Ideas are disjointed and transitions are absent or confusing.
7-10: Limited use of transitions; connections between ideas are unclear.
12-15: Ideas generally flow, but transitions could be smoother. Some minor lapses in logic.
18-19: Logical progression of ideas with effective transitions. Few, if any, lapses in coherence.
20: Ideas flow seamlessly with excellent transitions and logical structure throughout.

Structure (20 points)
3-5: Lacks clear introduction, body, or conclusion. Disorganized.
7-10: Basic structure present but weak organization or imbalance in sections.
12-15: Clear structure with distinct introduction, body, and conclusion. Some organizational flaws.
18-19: Well-organized with clear, balanced sections and smooth progression.
20: Exceptionally well-structured with engaging introduction, cohesive body, and strong conclusion.

Grammar (20 points)
3-5: Frequent grammatical errors severely hinder understanding.
7-10: Several errors in grammar and punctuation; some impact on readability.
12-15: Mostly correct grammar with occasional minor errors. Readability is not affected.
18-19: Very few minor errors; grammar enhances clarity and readability.
20: Flawless grammar and punctuation throughout.

Vocabulary (20 points)
3-5: Very limited vocabulary with frequent misuse of words.
7-10: Basic vocabulary; some word choice errors and repetition.
12-15: Adequate vocabulary with occasional variety and mostly correct word usage.
18-19: Rich and varied vocabulary, enhancing the essay’s tone and meaning.
20: Sophisticated, precise, and varied vocabulary that elevates the essay.
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
        response.choices[0].message.tool_calls[0].function.name === 'rate_essay'
      ) {
        const data =
          response.choices[0].message.tool_calls[0].function.arguments;
        const parsedData = JSON.parse(data);
        console.log(parsedData);
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
          description:
            'The full text of the essay to be evaluated. Do not edit or improve or correct the essay, only display what you can read as is',
        },
        studentName: {
          type: 'string',
          description:
            'Name of the student who wrote the essay. If not indicated put "No name"',
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
      required: ['essayContent', 'criteria', 'studentName'],
      additionalProperties: false,
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [rateEssay];
