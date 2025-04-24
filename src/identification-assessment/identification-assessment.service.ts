import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class IdentificationAssessmentService {
  async getAllIdentificationAssessments() {
    return prisma.identificationAssessment.findMany({
      include: { user: true, identificationResults: true },
    });
  }

  async getIdentificationAssessmentById(id: string) {
    return prisma.identificationAssessment.findUnique({
      where: { id },
      include: {
        user: true,
        identificationResults: true,
        identificationQuestions: true,
      },
    });
  }

  async getIdentificationAssessmentsByUserId(id: string) {
    console.log(id);
    const assessments = await prisma.identificationAssessment.findMany({
      where: { userId: id },
      include: {
        user: true,
        identificationResults: true,
        identificationQuestions: true,
      },
    });
    return assessments || [];
  }

  async createIdentificationAssessment(data: {
    name: string;
    firebaseId: string;
    questions: { correctAnswer: string; number: number }[];
  }) {
    const { name, firebaseId, questions } = data;

    const user = await prisma.user.findUnique({
      where: { firebaseId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.identificationAssessment.create({
      data: {
        name,
        userId: user.id,
        identificationQuestions: {
          create: questions.map((question) => ({
            number: question.number,
            correctAnswer: question.correctAnswer,
          })),
        },
      },
      include: {
        identificationQuestions: true,
      },
    });
  }

  async createIdentificationAssessmentById(data: {
    name: string;
    id: string;
    questions: { correctAnswer: string; number: number }[];
  }) {
    const { name, id, questions = [] } = data;

    return prisma.identificationAssessment.create({
      data: {
        name,
        userId: id,
        identificationQuestions: {
          create: questions.map((question) => ({
            correctAnswer: question.correctAnswer,
            number: question.number,
          })),
        },
      },
      include: {
        identificationQuestions: true,
      },
    });
  }

  async updateIdentificationAssessment(
    id: string,
    data: {
      name?: string;
      questions?: { correctAnswer: string; number: number }[];
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      await tx.identificationAssessment.update({
        where: { id },
        data: { name: data.name },
      });

      await tx.identificationQuestion.deleteMany({
        where: { assessmentId: id },
      });

      if (data.questions && data.questions.length > 0) {
        await tx.identificationAssessment.update({
          where: { id },
          data: {
            identificationQuestions: {
              create: data.questions.map((q) => ({
                number: q.number,
                correctAnswer: q.correctAnswer,
              })),
            },
          },
        });
      }

      return tx.identificationAssessment.findUnique({
        where: { id },
        include: {
          identificationQuestions: true,
          user: true,
          identificationResults: true,
        },
      });
    });
  }

  async deleteIdentificationAssessment(id: string) {
    return prisma.identificationAssessment.delete({
      where: { id },
    });
  }
}
