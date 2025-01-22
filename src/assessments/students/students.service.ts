import { Injectable } from '@nestjs/common';
import { prisma } from '../../prisma';

@Injectable()
export class StudentsService {
  async getAllStudentAssessments() {
    return prisma.studentAssessment.findMany();
  }

  async getStudentAssessmentById(id: string) {
    return prisma.studentAssessment.findUnique({
      where: { id },
    });
  }

  async assignAssessmentToStudent(data: {
    studentId: string;
    assessmentId: string;
  }) {
    return prisma.studentAssessment.create({
      data,
    });
  }

  async updateStudentAssessment(
    id: string,
    data: { essayResults?: any; identificationResults?: any },
  ) {
    return prisma.studentAssessment.update({
      where: { id },
      data,
    });
  }

  async deleteStudentAssessment(id: string) {
    return prisma.studentAssessment.delete({
      where: { id },
    });
  }

  async getAssessmentsByStudentId(studentId: string) {
    return prisma.studentAssessment.findMany({
      where: { studentId },
    });
  }

  async getStudentsByAssessmentId(assessmentId: string) {
    return prisma.studentAssessment.findMany({
      where: { assessmentId },
    });
  }
}
