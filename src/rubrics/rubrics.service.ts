import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class RubricsService {
  async getAllRubrics() {
    return prisma.rubric.findMany();
  }

  async getRubricById(id: string) {
    return prisma.rubric.findUnique({
      where: { id },
    });
  }

  async addRubric(data: {
    score: string;
    description: string;
    criteriaId: string;
  }) {
    return prisma.rubric.create({
      data,
    });
  }

  async updateRubric(
    id: string,
    data: { score?: string; description?: string },
  ) {
    return prisma.rubric.update({
      where: { id },
      data,
    });
  }

  async deleteRubric(id: string) {
    return prisma.rubric.delete({
      where: { id },
    });
  }

  async getRubricsByCriteriaId(criteriaId: string) {
    return prisma.rubric.findMany({
      where: { criteriaId },
    });
  }
}
