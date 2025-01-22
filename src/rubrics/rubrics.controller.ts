import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RubricsService } from './rubrics.service';

@Controller('rubrics')
export class RubricsController {
  constructor(private rubricsService: RubricsService) {}
}
