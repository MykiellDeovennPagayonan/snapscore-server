import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class EssayResultsService {
  async getAllEssayResults() {
    return prisma.essayResult.findMany({
      include: {
        assessment: true,
        questionResults: {
          include: {
            essayCriteriaResults: true,
          },
        },
      },
    });
  }

  async getEssayResultById(id: string) {
    const result = await prisma.essayResult.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            essayQuestions: {
              include: {
                essayCriteria: true,
              },
            },
          },
        },
        questionResults: {
          include: {
            question: true,
            essayCriteriaResults: {
              include: {
                criteria: true,
              },
            },
          },
        },
      },
    });
    if (!result) {
      throw new Error('Essay result not found');
    }
    console.log(result.questionResults[0].essayCriteriaResults[0].criteria);
    return result;
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
        criteriaId: string;
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
            questionId: result.questionId,
            essayCriteriaResults: {
              create: result.essayCriteriaResults.map((criteriaResult) => ({
                score: criteriaResult.score,
                criteriaId: criteriaResult.criteriaId,
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

  async updateEssayQuestionResult(id: string, data: { score?: number }) {
    return prisma.essayQuestionResult.update({
      where: { id },
      data,
    });
  }

  async updateEssayCriteriaResult(id: string, data: { score?: number }) {
    return prisma.essayCriteriaResult.update({
      where: { id },
      data,
    });
  }

  async updateEssayResult(id: string, data: { score?: number }) {
    return prisma.essayResult.update({
      where: { id },
      data,
    });
  }

  async deleteEssayResult(id: string) {
    return prisma.essayResult.delete({
      where: { id },
    });
  }

  async getResultsByStudentAssessmentId(assessmentId: string) {
    return prisma.essayResult.findMany({
      where: { assessmentId },
      include: {
        assessment: true,
        questionResults: {
          include: {
            essayCriteriaResults: {
              include: {
                // criteria: {
                //   include: {
                //     rubrics: true,
                //   },
                // },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // async getResultsByQuestionId(questionId: string) {
  //   return prisma.essayQuestionResult.findMany({
  //     where: { questionId },
  //     include: {
  //       result: {
  //         include: {
  //           assessment: true,
  //         },
  //       },
  //       question: true,
  //       essayCriteriaResults: {
  //         include: {
  //           criteria: true,
  //         },
  //       },
  //     },
  //   });
  // }
}
