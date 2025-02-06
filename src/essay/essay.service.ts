import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { ChatCompletionTool } from 'openai/resources/index.mjs';
import { prisma } from '../prisma';
import { UploadService } from '../upload/upload.service';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

@Injectable()
export class EssayService {
  private readonly logger = new Logger(EssayService.name);

  constructor(private uploadService: UploadService) {}

  private isValidId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async rateEssay(file: Express.Multer.File, assessmentId: string) {
    try {
      if (!this.isValidId(assessmentId)) {
        throw new BadRequestException('Invalid assessment ID format');
      }

      // 1. Upload the image and get the URL
      const uploadResult = await this.uploadService.uploadFile(
        `essays/${assessmentId}-${Date.now()}`,
        file,
      );

      // 2. Get assessment details from database
      const assessment = await prisma.essayAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          essayQuestions: {
            include: {
              essayCriteria: {
                include: {
                  rubrics: true,
                },
              },
            },
          },
        },
      });

      if (!assessment) {
        throw new BadRequestException('Assessment not found');
      }

      // Create a mapping of question sequence to question data
      const questionMap = new Map(
        assessment.essayQuestions.map((q, index) => [
          (index + 1).toString(),
          {
            id: q.id,
            criteriaIds: new Set(q.essayCriteria.map((c) => c.id)),
          },
        ]),
      );

      // 3. Convert image to base64 for OpenAI
      const imageBase64 = file.buffer.toString('base64');

      // 4. Create the evaluation prompt
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are an essay evaluation assistant. Evaluate the essay in the image according to the following questions and criteria. For each criterion, provide a score based on the rubric description and the maximum possible score specified. If there are no rubrics available, score it according to the name of the criteria and the maximum score. Make sure to utilize the full range of possible scores for each criterion based on its maxScore. Number each question starting from 1. Consider possible erasures or corrections in the essay.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${file.mimetype};base64,${imageBase64}`,
              },
            },
          ],
        },
      ];

      // 5. Get AI evaluation
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        tools: [getEvaluationTool(assessment)],
        tool_choice: { type: 'function', function: { name: 'evaluate_essay' } },
      });

      // 6. Process AI response
      if (response.choices[0].message.tool_calls) {
        const evaluationData = JSON.parse(
          response.choices[0].message.tool_calls[0].function.arguments,
        );

        // 7. Save results with validation
        const result = await prisma.essayResult.create({
          data: {
            studentName: evaluationData.studentName,
            score: evaluationData.totalScore,
            assessmentId,
            paperImage: uploadResult.url,
            questionResults: {
              create: evaluationData.questionResults.map((qResult) => {
                const questionData = questionMap.get(qResult.questionId);
                if (!questionData) {
                  throw new BadRequestException(
                    `Invalid question ID: ${qResult.questionId}`,
                  );
                }

                // Validate that all criteria belong to this question
                qResult.criteriaResults.forEach((cResult) => {
                  if (!questionData.criteriaIds.has(cResult.criteriaId)) {
                    throw new BadRequestException(
                      `Invalid criteria ID: ${cResult.criteriaId} for question ${qResult.questionId}`,
                    );
                  }
                });

                return {
                  answer: qResult.answer,
                  score: qResult.score,
                  questionId: questionData.id,
                  essayCriteriaResults: {
                    create: qResult.criteriaResults.map((cResult) => ({
                      score: cResult.score,
                      criteriaId: cResult.criteriaId,
                    })),
                  },
                };
              }),
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

        return result;
      }

      throw new BadRequestException('Failed to evaluate essay');
    } catch (error) {
      this.logger.error('Error evaluating essay:', error);
      throw new BadRequestException(
        `Failed to evaluate essay: ${error.message}`,
      );
    }
  }
}

function getEvaluationTool(assessment: any): ChatCompletionTool {
  // Create a structured representation of questions and their criteria
  const questions = assessment.essayQuestions.map((q, index) => ({
    sequence: index + 1,
    criteria: q.essayCriteria.map((c) => ({
      id: c.id,
      name: c.name || `Criteria ${c.id}`,
      description: c.description || '',
      maxScore: c.maxScore, // Include maxScore
      rubrics: c.rubrics || [],
    })),
  }));

  questions.forEach((q) => {
    console.log(`Question ${q.sequence}:`);
    q.criteria.forEach((c) => {
      console.log(`  - Criteria ${c.id}: ${c.name}`);
      console.log(`    Max Score: ${c.maxScore} points`);
      console.log('    Rubric Levels:');
      c.rubrics.forEach((r) => {
        console.log(`      - Score ${r.score}: ${r.description}`);
      });
    });
  });

  // Create a description of the assessment structure
  const assessmentDescription: string = questions
    .map((q) => {
      const criteriaDesc: string = q.criteria
        .map(
          (c) =>
            `    - Criteria ${c.id}: ${c.name}${
              c.description ? ` (${c.description})` : ''
            }\n      Max Score: ${c.maxScore} points\n      Rubric Levels:${c.rubrics
              .map((r) => `\n        - Score ${r.score}: ${r.description}`)
              .join('')}`,
        )
        .join('\n');

      return `Question ${q.sequence}:\n${criteriaDesc}`;
    })
    .join('\n\n');

  return {
    type: 'function',
    function: {
      name: 'evaluate_essay',
      description: `Evaluate an essay based on ${
        questions.length
      } questions and their criteria. Score each criterion based on its specified maximum score. The total possible score is ${questions.reduce(
        (total, q) =>
          total + q.criteria.reduce((subtotal, c) => subtotal + c.maxScore, 0),
        0,
      )}. Use question numbers (1, 2, 3, etc.) for questionId. Use the exact criteria IDs provided in the structure below:\n\n${assessmentDescription}`,
      parameters: {
        type: 'object',
        properties: {
          studentName: {
            type: 'string',
            description:
              'Name of the student if visible on the essay, otherwise "Unknown"',
          },
          totalScore: {
            type: 'number',
            description: 'Total score for the essay across all criteria',
          },
          questionResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: {
                  type: 'string',
                  description:
                    'Use the exact question id from the assessment structure above',
                },
                answer: {
                  type: 'string',
                  description: 'The answer provided in the essay',
                },
                score: {
                  type: 'number',
                  description:
                    'Total score for this question (sum of criteria scores)',
                },
                criteriaResults: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      criteriaId: {
                        type: 'string',
                        description:
                          'Use the exact criteria ID from the assessment structure above',
                      },
                      score: {
                        type: 'number',
                        description:
                          'Score for this specific criteria (must not exceed maxScore)',
                      },
                      justification: {
                        type: 'string',
                        description:
                          'Detailed explanation for the score given, referencing the rubric levels',
                      },
                    },
                    required: ['criteriaId', 'score', 'justification'],
                  },
                },
              },
              required: ['questionId', 'answer', 'score', 'criteriaResults'],
            },
          },
        },
        required: ['studentName', 'totalScore', 'questionResults'],
      },
    },
  };
}
