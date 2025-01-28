// eslint-disable-next-line prettier/prettier
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RubricsService } from './rubrics.service';

@Controller('rubrics')
export class RubricsController {
  constructor(private rubricsService: RubricsService) {}

  @Get()
  async getAllRubrics() {
    return this.rubricsService.getAllRubrics();
  }

  @Get(':id')
  async getRubricById(@Param('id') id: string) {
    return this.rubricsService.getRubricById(id);
  }

  @Post()
  async addRubric(@Body() addRubricDto: any) {
    return this.rubricsService.addRubric(addRubricDto);
  }

  @Put(':id')
  async updateRubric(@Param('id') id: string, @Body() updateRubricDto: any) {
    return this.rubricsService.updateRubric(id, updateRubricDto);
  }

  @Delete(':id')
  async deleteRubric(@Param('id') id: string) {
    return this.rubricsService.deleteRubric(id);
  }
}
