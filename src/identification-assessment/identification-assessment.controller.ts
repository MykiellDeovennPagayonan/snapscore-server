import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IdentificationAssessmentService } from './identification-assessment.service';

@Controller('identification-assessment')
export class IdentificationAssessmentController {
  constructor(private identificationService: IdentificationAssessmentService) {}

  @Get()
  async getAllIdentificationAssessments() {
    return this.identificationService.getAllIdentificationAssessments();
  }

  @Get(':id')
  async getIdentificationAssessmentById(@Param('id') id: string) {
    return this.identificationService.getIdentificationAssessmentById(id);
  }

  @Post()
  async createIdentificationAssessment(
    @Body()
    data: {
      name: string;
      firebaseId: string;
      questions: { correctAnswer: string }[];
    },
  ) {
    return this.identificationService.createIdentificationAssessment(data);
  }

  @Put(':id')
  async updateIdentificationAssessment(
    @Param('id') id: string,
    @Body() updateDto: { name?: string },
  ) {
    return this.identificationService.updateIdentificationAssessment(
      id,
      updateDto,
    );
  }

  @Delete(':id')
  async deleteIdentificationAssessment(@Param('id') id: string) {
    return this.identificationService.deleteIdentificationAssessment(id);
  }

  @Get('user-identification/:userId')
  async getAssessmentsByUser(@Param('userId') userId: string) {
    return this.identificationService.getIdentificationAssessmentsByUserId(
      userId,
    );
  }
}
