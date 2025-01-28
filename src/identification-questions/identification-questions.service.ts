import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class IdentificationQuestionsService {
  async getAllIdentificationQuestions() {
    return prisma.identificationQuestion.findMany();
  }

  async getIdentificationQuestionById(id: string) {
    return prisma.identificationQuestion.findUnique({
      where: { id },
    });
  }

  async addIdentificationQuestion(data: {
    question: string;
    correctAnswer: string;
    assessmentId: string;
  }) {
    return prisma.identificationQuestion.create({
      data,
    });
  }

  async updateIdentificationQuestion(
    id: string,
    data: { question?: string; correctAnswer?: string },
  ) {
    return prisma.identificationQuestion.update({
      where: { id },
      data,
    });
  }

  async deleteIdentificationQuestion(id: string) {
    return prisma.identificationQuestion.delete({
      where: { id },
    });
  }

  async getQuestionsByAssessmentId(assessmentId: string) {
    return prisma.identificationQuestion.findMany({
      where: { assessmentId },
    });
  }
}
