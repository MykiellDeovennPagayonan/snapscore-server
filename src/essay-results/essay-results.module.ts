import { Module } from '@nestjs/common';
import { EssayResultsController } from './essay-results.controller';
import { EssayResultsService } from './essay-results.service';

@Module({
  controllers: [EssayResultsController],
  providers: [EssayResultsService],
})
export class EssayResultsModule {}
