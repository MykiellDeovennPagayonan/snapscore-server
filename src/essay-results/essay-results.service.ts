import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class EssayResultsService {
  async getAllEssayResults() {
    return prisma.essayResult.findMany();
  }

  async getEssayResultById(id: string) {
    return prisma.essayResult.findUnique({
      where: { id },
    });
  }

  async addEssayResult(data: {
    score: number;
    studentId: string;
    questionId: string;
  }) {
    return prisma.essayResult.create({
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

  async getResultsByStudentAssessmentId(studentId: string) {
    return prisma.essayResult.findMany({
      where: { studentId },
    });
  }

  async getResultsByQuestionId(questionId: string) {
    return prisma.essayResult.findMany({
      where: { questionId },
    });
  }
}
