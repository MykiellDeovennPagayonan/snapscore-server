import { Module } from '@nestjs/common';
import { IdentificationAssessmentController } from './identification-assessment.controller';
import { IdentificationAssessmentService } from './identification-assessment.service';

@Module({
  controllers: [IdentificationAssessmentController],
  providers: [IdentificationAssessmentService],
})
export class IdentificationAssessmentModule {}
