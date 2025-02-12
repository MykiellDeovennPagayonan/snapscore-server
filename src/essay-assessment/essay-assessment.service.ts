import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class EssayAssessmentService {
  async getAllEssayAssessments() {
    return prisma.essayAssessment.findMany({
      include: { essayQuestions: true, user: true },
    });
  }

  async getEssayAssessmentById(id: string) {
    console.log('fetching essay assessment by id', id);
    return prisma.essayAssessment.findUnique({
      where: { id },
      include: {
        essayQuestions: {
          include: { essayCriteria: { include: { rubrics: true } } },
        },
        essayResults: true,
        user: true,
      },
    });
  }

  async getEssayAssessmentByUserId(id: string) {
    console.log('fetching essay assessment by user id', id);
    return prisma.essayAssessment.findMany({
      where: { userId: id },
      include: {
        essayQuestions: {
          include: { essayCriteria: { include: { rubrics: true } } },
        },
        essayResults: true,
        user: true,
      },
    });
  }

  async createEssayAssessment(data: {
    name: string;
    firebaseId: string;
    questions: {
      question: string;
      essayCriteria: {
        criteria: string;
        maxScore: number;
        rubrics: {
          score: string;
          description: string;
        }[];
      }[];
    }[];
  }) {
    const { name, firebaseId, questions } = data;

    const user = await prisma.user.findUnique({
      where: { firebaseId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.essayAssessment.create({
      data: {
        name,
        userId: user.id,
        essayQuestions: {
          create: questions.map((questionData) => ({
            question: questionData.question,
            essayCriteria: {
              create: questionData.essayCriteria.map((criteriaData) => ({
                criteria: criteriaData.criteria,
                maxScore: criteriaData.maxScore,
                rubrics: {
                  create: criteriaData.rubrics.map((rubricData) => ({
                    score: rubricData.score,
                    description: rubricData.description,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        essayQuestions: {
          include: {
            essayCriteria: {
              include: { rubrics: true },
            },
          },
        },
      },
    });
  }

  async createEssayAssessmentById(data: {
    name: string;
    id: string;
    questions: {
      question: string;
      essayCriteria: {
        criteria: string;
        maxScore: number;
        rubrics: {
          score: string;
          description: string;
        }[];
      }[];
    }[];
  }) {
    const { name, id, questions = [] } = data;

    return prisma.essayAssessment.create({
      data: {
        name,
        userId: id,
        essayQuestions: {
          create: questions.map((questionData) => ({
            question: questionData.question,
            essayCriteria: {
              create: questionData.essayCriteria.map((criteriaData) => ({
                criteria: criteriaData.criteria,
                maxScore: criteriaData.maxScore,
                rubrics: {
                  create: criteriaData.rubrics.map((rubricData) => ({
                    score: rubricData.score,
                    description: rubricData.description,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        essayQuestions: {
          include: {
            essayCriteria: {
              include: { rubrics: true },
            },
          },
        },
      },
    });
  }

  // Updated update method to update the assessment name and completely replace nested essay questions.
  async updateEssayAssessment(
    id: string,
    data: {
      name?: string;
      questions?: {
        question: string;
        essayCriteria: {
          criteria: string;
          maxScore: number;
          rubrics: { score: string; description: string }[];
        }[];
      }[];
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update the assessment name if provided.
      if (data.name) {
        await tx.essayAssessment.update({
          where: { id },
          data: { name: data.name },
        });
      }

      // Delete all existing essay questions for this assessment.
      await tx.essayQuestion.deleteMany({
        where: { assessmentId: id },
      });

      // If new questions are provided, create them with their nested criteria and rubrics.
      if (data.questions && data.questions.length > 0) {
        await tx.essayAssessment.update({
          where: { id },
          data: {
            essayQuestions: {
              create: data.questions.map((questionData) => ({
                question: questionData.question,
                essayCriteria: {
                  create: questionData.essayCriteria.map((criteriaData) => ({
                    criteria: criteriaData.criteria,
                    maxScore: criteriaData.maxScore,
                    rubrics: {
                      create: criteriaData.rubrics.map((rubricData) => ({
                        score: rubricData.score,
                        description: rubricData.description,
                      })),
                    },
                  })),
                },
              })),
            },
          },
        });
      }

      // Return the updated essay assessment with its nested relations.
      return tx.essayAssessment.findUnique({
        where: { id },
        include: {
          essayQuestions: {
            include: {
              essayCriteria: { include: { rubrics: true } },
            },
          },
          user: true,
          essayResults: true,
        },
      });
    });
  }

  async deleteEssayAssessment(id: string) {
    return prisma.essayAssessment.delete({
      where: { id },
    });
  }

  async getAllAssessmentsByUser(userId: string) {
    const essayAssessments = await prisma.essayAssessment.findMany({
      where: { userId },
    });

    const identificationAssessments =
      await prisma.identificationAssessment.findMany({
        where: { userId },
      });

    const assessments = [
      ...essayAssessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.name,
        type: 'essay' as const,
      })),
      ...identificationAssessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.name,
        type: 'identification' as const,
      })),
    ];

    return assessments;
  }
}
