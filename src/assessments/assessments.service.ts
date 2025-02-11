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
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, createdAt: true },
    });

    const identificationAssessments =
      await prisma.identificationAssessment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, createdAt: true },
      });

    const combinedAssessments = [
      ...essayAssessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.name,
        type: 'essay',
        createdAt: assessment.createdAt,
      })),
      ...identificationAssessments.map((assessment) => ({
        id: assessment.id,
        title: assessment.name,
        type: 'identification',
        createdAt: assessment.createdAt,
      })),
    ];

    combinedAssessments.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    return combinedAssessments;
  }
}
