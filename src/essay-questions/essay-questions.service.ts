import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class EssayQuestionsService {
  async getAllEssayQuestions() {
    return prisma.essayQuestion.findMany();
  }

  async getEssayQuestionById(id: string) {
    return prisma.essayQuestion.findUnique({
      where: { id },
    });
  }

  async addEssayQuestion(data: { question: string; assessmentId: string }) {
    return prisma.essayQuestion.create({
      data,
    });
  }

  async updateEssayQuestion(id: string, data: { question?: string }) {
    return prisma.essayQuestion.update({
      where: { id },
      data,
    });
  }

  async deleteEssayQuestion(id: string) {
    return prisma.essayQuestion.delete({
      where: { id },
    });
  }

  async getQuestionsByAssessmentId(assessmentId: string) {
    return prisma.essayQuestion.findMany({
      where: { assessmentId },
    });
  }
}
