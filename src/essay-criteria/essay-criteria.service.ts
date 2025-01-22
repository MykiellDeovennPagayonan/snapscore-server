import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class EssayCriteriaService {
  async getAllEssayCriteria() {
    return prisma.essayCriteria.findMany();
  }

  async getEssayCriteriaById(id: string) {
    return prisma.essayCriteria.findUnique({
      where: { id },
    });
  }

  async addEssayCriteria(data: { criteria: string; maxScore: number; essayQuestionId: string }) {
    return prisma.essayCriteria.create({
      data,
    });
  }

  async updateEssayCriteria(
    id: string,
    data: { criteria?: string; maxScore?: number }
  ) {
    return prisma.essayCriteria.update({
      where: { id },
      data,
    });
  }

  async deleteEssayCriteria(id: string) {
    return prisma.essayCriteria.delete({
      where: { id },
    });
  }

  async getCriteriaByEssayQuestionId(essayQuestionId: string) {
    return prisma.essayCriteria.findMany({
      where: { essayQuestionId },
    });
  }
}
