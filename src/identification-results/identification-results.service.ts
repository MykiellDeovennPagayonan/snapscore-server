import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class IdentificationResultsService {
  async getAllIdentificationResults() {
    return prisma.identificationResult.findMany();
  }

  async getIdentificationResultById(id: string) {
    return prisma.identificationResult.findUnique({
      where: { id },
    });
  }

  async addIdentificationResult(data: {
    isCorrect: boolean;
    studentId: string;
    questionId: string;
  }) {
    return prisma.identificationResult.create({
      data,
    });
  }

  async updateIdentificationResult(id: string, data: { isCorrect?: boolean }) {
    return prisma.identificationResult.update({
      where: { id },
      data,
    });
  }

  async deleteIdentificationResult(id: string) {
    return prisma.identificationResult.delete({
      where: { id },
    });
  }

  async getResultsByStudentAssessmentId(studentId: string) {
    return prisma.identificationResult.findMany({
      where: { studentId },
    });
  }

  async getResultsByQuestionId(questionId: string) {
    return prisma.identificationResult.findMany({
      where: { questionId },
    });
  }
}
