import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class IdentificationResultsService {
  async getAllIdentificationResults() {
    return prisma.identificationResult.findMany({
      include: {
        assessment: true,
        questionResults: true,
      },
    });
  }

  async getIdentificationResultById(id: string) {
    return prisma.identificationResult.findUnique({
      where: { id },
      include: {
        assessment: true,
        questionResults: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async addIdentificationResult(data: {
    studentName: string;
    assessmentId: string;
    questionResults: {
      isCorrect: boolean;
      answer: string;
      questionId: string;
    }[];
  }) {
    return prisma.identificationResult.create({
      data: {
        studentName: data.studentName,
        assessmentId: data.assessmentId,
        questionResults: {
          create: data.questionResults.map((result) => ({
            isCorrect: result.isCorrect,
            questionId: result.questionId,
            answer: result.answer,
          })),
        },
      },
    });
  }

  async updateIdentificationResult(id: string, data: { studentName?: string }) {
    return prisma.identificationResult.update({
      where: { id },
      data,
    });
  }

  async updateIdentificationQuestionResult(
    id: string,
    data: { isCorrect?: boolean },
  ) {
    return prisma.identificationQuestionResult.update({
      where: {
        id: id,
      },
      data,
    });
  }

  async deleteIdentificationResult(id: string) {
    return prisma.identificationResult.delete({
      where: { id },
    });
  }

  async getResultsByStudentAssessmentId(assessmentId: string) {
    console.log('got results by student assessment id');
    return prisma.identificationResult.findMany({
      where: { assessmentId },
      include: {
        questionResults: true,
      },
    });
  }

  async getResultsByQuestionId(questionId: string) {
    return prisma.identificationQuestionResult.findMany({
      where: { questionId },
      include: {
        result: {
          include: {
            assessment: true,
          },
        },
        question: true,
      },
    });
  }
}
