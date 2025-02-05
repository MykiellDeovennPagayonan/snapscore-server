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
      include: { user: true, identificationResults: true },
    });
  }

  async getIdentificationAssessmentsByFirebaseId(firebaseId: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.identificationAssessment.findMany({
      where: { userId: user.id },
      include: { user: true, identificationResults: true },
    });
  }

  async createIdentificationAssessment(data: {
    name: string;
    firebaseId: string;
    questions: { correctAnswer: string }[];
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
            correctAnswer: question.correctAnswer,
          })),
        },
      },
      include: {
        identificationQuestions: true,
      },
    });
  }

  async updateIdentificationAssessment(id: string, data: { name?: string }) {
    return prisma.identificationAssessment.update({
      where: { id },
      data,
    });
  }

  async deleteIdentificationAssessment(id: string) {
    return prisma.identificationAssessment.delete({
      where: { id },
    });
  }
}
