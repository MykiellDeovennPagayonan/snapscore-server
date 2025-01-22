import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('student-assessments')
export class StudentAssessmentsController {
  constructor(private studentAssessmentsService: StudentsService) {}

  @Get()
  async getAllStudentAssessments() {
    return this.studentAssessmentsService.getAllStudentAssessments();
  }

  @Get(':id')
  async getStudentAssessmentById(@Param('id') id: string) {
    return this.studentAssessmentsService.getStudentAssessmentById(id);
  }

  @Post()
  async assignAssessmentToStudent(@Body() assignAssessmentDto: any) {
    return this.studentAssessmentsService.assignAssessmentToStudent(
      assignAssessmentDto,
    );
  }

  @Put(':id')
  async updateStudentAssessment(
    @Param('id') id: string,
    @Body() updateAssessmentDto: any,
  ) {
    return this.studentAssessmentsService.updateStudentAssessment(
      id,
      updateAssessmentDto,
    );
  }

  @Delete(':id')
  async deleteStudentAssessment(@Param('id') id: string) {
    return this.studentAssessmentsService.deleteStudentAssessment(id);
  }

  @Get('student/:studentId')
  async getAssessmentsByStudentId(@Param('studentId') studentId: string) {
    return this.studentAssessmentsService.getAssessmentsByStudentId(studentId);
  }

  @Get('assessment/:assessmentId')
  async getStudentsByAssessmentId(@Param('assessmentId') assessmentId: string) {
    return this.studentAssessmentsService.getStudentsByAssessmentId(
      assessmentId,
    );
  }
}
