import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EssayResultsService } from './essay-results.service';

@Controller('essay-results')
export class EssayResultsController {
  constructor(private essayResultsService: EssayResultsService) {}
}
