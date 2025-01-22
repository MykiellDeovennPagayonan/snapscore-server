import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { IdentificationQuestionsService } from './identification-questions.service';

@Controller('identification-questions')
export class IdentificationQuestionsController {
  constructor(
    private identificationQuestionsService: IdentificationQuestionsService,
  ) {}

  @Get()
  async getAllIdentificationQuestions() {
    return this.identificationQuestionsService.getAllIdentificationQuestions();
  }

  @Get(':id')
  async getIdentificationQuestionById(@Param('id') id: string) {
    return this.identificationQuestionsService.getIdentificationQuestionById(
      id,
    );
  }

  @Post()
  async addIdentificationQuestion(@Body() addQuestionDto: any) {
    return this.identificationQuestionsService.addIdentificationQuestion(
      addQuestionDto,
    );
  }

  @Put(':id')
  async updateIdentificationQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: any,
  ) {
    return this.identificationQuestionsService.updateIdentificationQuestion(
      id,
      updateQuestionDto,
    );
  }

  @Delete(':id')
  async deleteIdentificationQuestion(@Param('id') id: string) {
    return this.identificationQuestionsService.deleteIdentificationQuestion(id);
  }
}
