import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class AssessmentsService {
  async getAllAssessmentsByUser(firebaseId: string) {
    console.log(firebaseId);
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const essayAssessments = await prisma.essayAssessment.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
    });

    const identificationAssessments =
      await prisma.identificationAssessment.findMany({
        where: { userId: user.id },
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
