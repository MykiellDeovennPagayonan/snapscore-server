import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EssayAssessmentService } from './essay-assessment.service';

@Controller('essay-assessment')
export class EssayAssessmentController {
  constructor(private essayService: EssayAssessmentService) {}

  @Get()
  async getAllEssayAssessments() {
    return this.essayService.getAllEssayAssessments();
  }

  @Get(':id')
  async getEssayAssessmentById(@Param('id') id: string) {
    return this.essayService.getEssayAssessmentById(id);
  }

  @Post()
  async createEssayAssessment(
    @Body()
    data: {
      name: string;
      firebaseId: string;
      questions: {
        question: string;
        essayCriteria: {
          criteria: string;
          maxScore: number;
          rubrics: {
            score: string;
            description: string;
          }[];
        }[];
      }[];
    },
  ) {
    return this.essayService.createEssayAssessment(data);
  }

  @Post('user')
  async createEssayAssessmentById(
    @Body()
    data: {
      name: string;
      id: string;
      questions: {
        question: string;
        essayCriteria: {
          criteria: string;
          maxScore: number;
          rubrics: {
            score: string;
            description: string;
          }[];
        }[];
      }[];
    },
  ) {
    return this.essayService.createEssayAssessmentById(data);
  }

  @Put(':id')
  async updateEssayAssessment(
    @Param('id') id: string,
    @Body() updateDto: { name?: string },
  ) {
    return this.essayService.updateEssayAssessment(id, updateDto);
  }

  @Delete(':id')
  async deleteEssayAssessment(@Param('id') id: string) {
    return this.essayService.deleteEssayAssessment(id);
  }

  @Get('user/:userId')
  async getAssessmentsByUser(@Param('userId') userId: string) {
    return this.essayService.getAllAssessmentsByUser(userId);
  }

  @Get('user-essay/:userId')
  async getEssayAssessmentByUserId(@Param('userId') userId: string) {
    return this.essayService.getEssayAssessmentByUserId(userId);
  }
}
