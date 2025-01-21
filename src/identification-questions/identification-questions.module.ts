import { Module } from '@nestjs/common';
import { IdentificationQuestionsController } from './identification-questions.controller';
import { IdentificationQuestionsService } from './identification-questions.service';

@Module({
  controllers: [IdentificationQuestionsController],
  providers: [IdentificationQuestionsService],
})
export class IdentificationQuestionsModule {}
