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

  async gradeIdentification(filename: string): Promise<number> {
    try {
      const imageBase64 = await this.convertImageToBase64(filename);

      if (!imageBase64) {
        throw new BadRequestException('Failed to convert image to Base64');
      }

      console.log(imageBase64);

      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are an AI that will check the identification test. Check the indentification answers always use the check_identification function. The answer sheet is as follows:
          
1. Mitochondria
2. Iron
3. Nitrogen
4. Newton’s First Law of Motion (Inertia)
5. Mars
6. Photosynthesis
7. Albert Einstein
8. NaCl
9. Heart
10. Diamond
11. Ampere (A)
12. O negative
13. 100°C
14. Aurora Borealis
15. Leaf
16. Hydrogen
17. Alexander Fleming
18. Newton (N)
19. Saturn
20. Seismology
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
        console.log(parsedData);
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
                description: "The student's provided answer for the item.",
              },
              isCorrect: {
                type: 'boolean',
                description:
                  "Indicates if the student's answer matches the correct answer.",
              },
              manualCheck: {
                type: 'boolean',
                description:
                  'Indicates that the item needs manual checking as the AI is doubtful about the correctedness of the checking. Happens could be of very poor handwriting which is not readable by the AI.',
              },
            },
            required: [
              'itemNumber',
              'correctAnswer',
              'studentAnswer',
              'isCorrect',
              'manualCheck',
            ],
          },
        },
      },
      required: ['items', 'studentName'],
      additionalProperties: false,
    },
  },
};

const functionCallingTools: ChatCompletionTool[] = [checkIdentification];
