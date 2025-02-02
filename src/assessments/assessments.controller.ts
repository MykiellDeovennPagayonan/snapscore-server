import { Controller, Get, Param } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';

@Controller('assessments')
export class AssessmentsController {
  constructor(private assessmentsService: AssessmentsService) {}

  @Get('user/:userId')
  async getAllAssessmentsByUser(@Param('userId') userId: string) {
    return this.assessmentsService.getAllAssessmentsByUser(userId);
  }
}
