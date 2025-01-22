import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EssayResultsService } from './essay-results.service';

@Controller('essay-results')
export class EssayResultsController {
  constructor(private essayResultsService: EssayResultsService) {}

  // Get all essay results
  @Get()
  async getAllEssayResults() {
    return this.essayResultsService.getAllEssayResults();
  }

  // Get a specific essay result by ID
  @Get(':id')
  async getEssayResultById(@Param('id') id: string) {
    return this.essayResultsService.getEssayResultById(id);
  }

  // Record a student's essay result
  @Post()
  async recordEssayResult(
    @Body()
    recordEssayResultDto: {
      score: number;
      studentId: string;
      questionId: string;
    },
  ) {
    return this.essayResultsService.addEssayResult(recordEssayResultDto);
  }

  // Update an essay result by ID
  @Put(':id')
  async updateEssayResult(
    @Param('id') id: string,
    @Body() updateEssayResultDto: any,
  ) {
    return this.essayResultsService.updateEssayResult(id, updateEssayResultDto);
  }

  // Delete an essay result by ID
  @Delete(':id')
  async deleteEssayResult(@Param('id') id: string) {
    return this.essayResultsService.deleteEssayResult(id);
  }
}
