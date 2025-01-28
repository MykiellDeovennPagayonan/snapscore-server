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

  async createEssayAssessment(data: { name: string; userId: string }) {
    return prisma.essayAssessment.create({
      data,
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
