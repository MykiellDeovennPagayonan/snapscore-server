import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class AssessmentsService {
  async getAllAssessments() {
    return prisma.assessment.findMany();
  }

  async getAssessmentById(id: string) {
    return prisma.assessment.findUnique({
      where: { id },
    });
  }

  async createAssessment(data: { name: string; userId: string }) {
    return prisma.assessment.create({
      data,
    });
  }

  async updateAssessment(id: string, data: { name?: string }) {
    return prisma.assessment.update({
      where: { id },
      data,
    });
  }

  async deleteAssessment(id: string) {
    return prisma.assessment.delete({
      where: { id },
    });
  }

  async getAssessmentsByUserId(userId: string) {
    return prisma.assessment.findMany({
      where: { userId },
    });
  }
}
