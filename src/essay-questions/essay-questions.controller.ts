import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EssayQuestionsService } from './essay-questions.service';

@Controller('essay-questions')
export class EssayQuestionsController {
  constructor(private essayQuestionsService: EssayQuestionsService) {}

  @Get()
  async getAllEssayQuestions() {
    return this.essayQuestionsService.getAllEssayQuestions();
  }

  @Get(':id')
  async getEssayQuestionById(@Param('id') id: string) {
    return this.essayQuestionsService.getEssayQuestionById(id);
  }

  @Post()
  async addEssayQuestion(@Body() addEssayDto: any) {
    return this.essayQuestionsService.addEssayQuestion(addEssayDto);
  }

  @Put(':id')
  async updateEssayQuestion(
    @Param('id') id: string,
    @Body() updateEssayDto: any,
  ) {
    return this.essayQuestionsService.updateEssayQuestion(id, updateEssayDto);
  }

  @Delete(':id')
  async deleteEssayQuestion(@Param('id') id: string) {
    return this.essayQuestionsService.deleteEssayQuestion(id);
  }
}
