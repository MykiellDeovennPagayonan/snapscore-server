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
    console.log('fetching essay assessment by id', id);
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
              include: {
                rubrics: true,
              },
            },
          },
        },
      },
    });
  }

  async updateEssayAssessment(id: string, data: { name?: string }) {
    return prisma.essayAssessment.update({
      where: { id },
      data,
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
