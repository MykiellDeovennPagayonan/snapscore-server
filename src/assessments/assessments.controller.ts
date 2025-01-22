import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AssessmentsService } from './assessments.service';

@Controller('assessments')
export class AssessmentsController {
  constructor(private assessmentsService: AssessmentsService) {}

  @Get()
  async getAllAssessments() {
    return this.assessmentsService.getAllAssessments();
  }

  @Get(':id')
  async getAssessmentById(@Param('id') id: string) {
    return this.assessmentsService.getAssessmentById(id);
  }

  @Post()
  async createAssessment(@Body() createAssessmentDto: any) {
    return this.assessmentsService.createAssessment(createAssessmentDto);
  }

  @Put(':id')
  async updateAssessment(
    @Param('id') id: string,
    @Body() updateAssessmentDto: any,
  ) {
    return this.assessmentsService.updateAssessment(id, updateAssessmentDto);
  }

  @Delete(':id')
  async deleteAssessment(@Param('id') id: string) {
    return this.assessmentsService.deleteAssessment(id);
  }

  @Get('user/:userId')
  async getAssessmentsByUserId(@Param('userId') userId: string) {
    return this.assessmentsService.getAssessmentsByUserId(userId);
  }
}
