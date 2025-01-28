import { Module } from '@nestjs/common';
import { EssayAssessmentController } from './essay-assessment.controller';
import { EssayAssessmentService } from './essay-assessment.service';

@Module({
  controllers: [EssayAssessmentController],
  providers: [EssayAssessmentService],
})
export class EssayAssessmentModule {}
