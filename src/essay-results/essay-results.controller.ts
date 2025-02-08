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
    console.log(id);
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
        answer: string;
        essayCriteriaResults: {
          criteriaId: string;
          score: number;
        }[];
      }[];
    },
  ) {
    return this.essayResultsService.addEssayResult(recordEssayResultDto);
  }

  @Put('/question/:id')
  async updateEssayQuestionResult(
    @Param('id') id: string,
    @Body()
    updateEssayQuestionResultDto: {
      answer?: string;
      score?: number;
    },
  ) {
    return this.essayResultsService.updateEssayQuestionResult(
      id,
      updateEssayQuestionResultDto,
    );
  }

  @Put('/criteria/:id')
  async updateEssayCriteriaResult(
    @Param('id') id: string,
    @Body()
    updateEssayCriteriaResultDto: {
      score?: number;
    },
  ) {
    return this.essayResultsService.updateEssayCriteriaResult(
      id,
      updateEssayCriteriaResultDto,
    );
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
