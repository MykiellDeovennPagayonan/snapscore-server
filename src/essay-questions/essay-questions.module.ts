import { Module } from '@nestjs/common';
import { EssayQuestionsController } from './essay-questions.controller';
import { EssayQuestionsService } from './essay-questions.service';

@Module({
  controllers: [EssayQuestionsController],
  providers: [EssayQuestionsService],
})
export class EssayQuestionsModule {}
