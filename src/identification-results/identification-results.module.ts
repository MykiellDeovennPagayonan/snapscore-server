import { Module } from '@nestjs/common';
import { IdentificationResultsController } from './identification-results.controller';
import { IdentificationResultsService } from './identification-results.service';

@Module({
  controllers: [IdentificationResultsController],
  providers: [IdentificationResultsService],
})
export class IdentificationResultsModule {}
