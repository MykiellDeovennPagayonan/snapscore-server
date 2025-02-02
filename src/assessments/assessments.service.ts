import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class AssessmentsService {
  async getAllAssessmentsByUser(userId: string) {
    const essayAssessments = await prisma.essayAssessment.findMany({
      where: { userId },
      select: { id: true, name: true },
    });

    const identificationAssessments =
      await prisma.identificationAssessment.findMany({
        where: { userId },
        select: { id: true, name: true },
      });

    return [
      ...essayAssessments.map((a) => ({
        id: a.id,
        title: a.name,
        type: 'essay',
      })),
      ...identificationAssessments.map((a) => ({
        id: a.id,
        title: a.name,
        type: 'identification',
      })),
    ];
  }
}
