import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IdentificationQuestionsService } from './identification-questions.service';

@Controller('identification-questions')
export class IdentificationQuestionsController {
  constructor(private readonly identificationQuestionsService: IdentificationQuestionsService) {} 
}
