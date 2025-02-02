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

  @Get()
  async getAllEssayResults() {
    return this.essayResultsService.getAllEssayResults();
  }

  @Get(':id')
  async getEssayResultById(@Param('id') id: string) {
    return this.essayResultsService.getEssayResultById(id);
  }

  @Get('assessment/:id')
  async getResultsByStudentAssessmentId(@Param('id') id: string) {
    return this.essayResultsService.getResultsByStudentAssessmentId(id);
  }

  @Post()
  async recordEssayResult(
    @Body()
    recordEssayResultDto: {
      studentName: string;
      assessmentId: string;
      score: number;
      questionResults: {
        questionId: string;
        score: number;
        essayCriteriaResults: {
          criteriaId: string;
          score: number;
        }[];
      }[];
    },
  ) {
    return this.essayResultsService.addEssayResult(recordEssayResultDto);
  }

  @Put(':id')
  async updateEssayResult(
    @Param('id') id: string,
    @Body()
    updateEssayResultDto: {
      studentName?: string;
      score?: number;
    },
  ) {
    return this.essayResultsService.updateEssayResult(id, updateEssayResultDto);
  }

  @Delete(':id')
  async deleteEssayResult(@Param('id') id: string) {
    return this.essayResultsService.deleteEssayResult(id);
  }
}
