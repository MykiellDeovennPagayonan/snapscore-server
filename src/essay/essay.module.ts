import { Module } from '@nestjs/common';
import { EssayController } from './essay.controller';
import { EssayService } from './essay.service';

@Module({
  controllers: [EssayController],
  providers: [EssayService],
})
export class EssayModule {}
