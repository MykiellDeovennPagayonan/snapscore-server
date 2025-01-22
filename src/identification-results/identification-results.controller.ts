import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { IdentificationResultsService } from './identification-results.service';

@Controller('identification-results')
export class IdentificationResultsController {
  constructor(private identificationResultsService: IdentificationResultsService) {}
}
