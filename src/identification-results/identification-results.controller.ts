import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IdentificationResultsService } from './identification-results.service';

@Controller('identification-results')
export class IdentificationResultsController {
  constructor(
    private identificationResultsService: IdentificationResultsService,
  ) {}

  @Get()
  async getAllIdentificationResults() {
    return this.identificationResultsService.getAllIdentificationResults();
  }

  @Get(':id')
  async getIdentificationResultById(@Param('id') id: string) {
    return this.identificationResultsService.getIdentificationResultById(id);
  }

  @Get('assessment/:id')
  async getResultsByStudentAssessmentId(@Param('id') id: string) {
    return this.identificationResultsService.getResultsByStudentAssessmentId(
      id,
    );
  }

  @Post()
  async recordIdentificationResult(
    @Body()
    recordIdentificationResultDto: {
      studentName: string;
      assessmentId: string;
      questionResults: {
        questionId: string;
        isCorrect: boolean;
      }[];
    },
  ) {
    return this.identificationResultsService.addIdentificationResult(
      recordIdentificationResultDto,
    );
  }

  @Put(':id')
  async updateIdentificationResult(
    @Param('id') id: string,
    @Body()
    updateIdentificationResultDto: {
      studentName?: string;
    },
  ) {
    return this.identificationResultsService.updateIdentificationResult(
      id,
      updateIdentificationResultDto,
    );
  }

  @Delete(':id')
  async deleteIdentificationResult(@Param('id') id: string) {
    return this.identificationResultsService.deleteIdentificationResult(id);
  }
}
