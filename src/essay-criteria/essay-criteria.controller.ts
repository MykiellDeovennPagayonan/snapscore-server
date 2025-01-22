import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EssayCriteriaService } from './essay-criteria.service';

@Controller('essay-criteria')
export class EssayCriteriaController {
  constructor(private essayCriteriaService: EssayCriteriaService) {}
}
