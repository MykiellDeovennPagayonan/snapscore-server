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

  // Get all identification results
  @Get()
  async getAllIdentificationResults() {
    return this.identificationResultsService.getAllIdentificationResults();
  }

  // Get a specific identification result by ID
  @Get(':id')
  async getIdentificationResultById(@Param('id') id: string) {
    return this.identificationResultsService.getIdentificationResultById(id);
  }

  // Record a student's identification result
  @Post()
  async recordIdentificationResult(
    @Body()
    recordIdentificationResultDto: {
      isCorrect: boolean;
      studentId: string;
      questionId: string;
    },
  ) {
    return this.identificationResultsService.addIdentificationResult(
      recordIdentificationResultDto,
    );
  }

  // Update an identification result by ID
  @Put(':id')
  async updateIdentificationResult(
    @Param('id') id: string,
    @Body() updateIdentificationResultDto: any,
  ) {
    return this.identificationResultsService.updateIdentificationResult(
      id,
      updateIdentificationResultDto,
    );
  }

  // Delete an identification result by ID
  @Delete(':id')
  async deleteIdentificationResult(@Param('id') id: string) {
    return this.identificationResultsService.deleteIdentificationResult(id);
  }
}
