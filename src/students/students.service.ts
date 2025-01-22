import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class StudentsService {
  async getAllStudents() {
    return prisma.student.findMany();
  }

  async getStudentById(id: string) {
    return prisma.student.findUnique({
      where: { id },
    });
  }

  async createStudent(data: { fullName: string; userId: string }) {
    return prisma.student.create({
      data,
    });
  }

  async updateStudent(id: string, data: { fullName?: string }) {
    return prisma.student.update({
      where: { id },
      data,
    });
  }

  async deleteStudent(id: string) {
    return prisma.student.delete({
      where: { id },
    });
  }

  async getStudentsByUserId(userId: string) {
    return prisma.student.findMany({
      where: { userId },
    });
  }
}
