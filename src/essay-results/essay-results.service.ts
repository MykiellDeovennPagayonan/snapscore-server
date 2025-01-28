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
  }

  async getEssayResultById(id: string) {
    return prisma.essayResult.findUnique({
      where: { id },
      include: {
        assessment: true,
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
  }

  async addEssayResult(data: {
    studentName: string;
    assessmentId: string;
    score: number;
    questionResults: {
      questionId: string;
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
  }

  async getResultsByQuestionId(questionId: string) {
    return prisma.essayQuestionResult.findMany({
      where: { questionId },
      include: {
        result: {
          include: {
            assessment: true,
          },
        },
        question: true,
        essayCriteriaResults: {
          include: {
            criteria: true,
          },
        },
      },
    });
  }
}
