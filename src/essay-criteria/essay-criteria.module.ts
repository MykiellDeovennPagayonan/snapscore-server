import { Module } from '@nestjs/common';
import { EssayCriteriaController } from './essay-criteria.controller';
import { EssayCriteriaService } from './essay-criteria.service';

@Module({
  controllers: [EssayCriteriaController],
  providers: [EssayCriteriaService],
})
export class EssayCriteriaModule {}
