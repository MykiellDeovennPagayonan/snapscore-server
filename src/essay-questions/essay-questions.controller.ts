import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EssayQuestionsService } from './essay-questions.service';

@Controller('essay-questions')
export class EssayQuestionsController {
  constructor(private essayQuestionsService: EssayQuestionsService) {}
}
