import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class IdentificationAssessmentService {
  async getAllIdentificationAssessments() {
    return prisma.identificationAssessment.findMany({
      include: { identificationQuestions: true, user: true },
    });
  }

  async getIdentificationAssessmentById(id: string) {
    console.log('fetching identification assessment by id', id);
    console.log('Got here');
    return prisma.identificationAssessment.findUnique({
      where: { id },
      include: {
        identificationQuestions: true,
        identificationResults: true,
        user: true,
      },
    });
  }

  async getIdentificationAssessmentByUserId(id: string) {
    return prisma.identificationAssessment.findMany({
      where: { userId: id },
      include: {
        identificationQuestions: true,
        identificationResults: true,
        user: true,
      },
    });
  }

  async createIdentificationAssessment(data: { name: string; userId: string }) {
    console.log('Identification created');
    return prisma.identificationAssessment.create({
      data,
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
