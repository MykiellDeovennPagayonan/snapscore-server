import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { EssayCriteriaService } from './essay-criteria.service';

@Controller('essay-criteria')
export class EssayCriteriaController {
  constructor(private essayCriteriaService: EssayCriteriaService) {}

  @Get()
  async getAllEssayCriteria() {
    return this.essayCriteriaService.getAllEssayCriteria();
  }

  @Get(':id')
  async getEssayCriteriaById(@Param('id') id: string) {
    return this.essayCriteriaService.getEssayCriteriaById(id);
  }

  @Post()
  async addEssayCriteria(@Body() addCriteriaDto: any) {
    return this.essayCriteriaService.addEssayCriteria(addCriteriaDto);
  }

  @Put(':id')
  async updateEssayCriteria(
    @Param('id') id: string,
    @Body() updateCriteriaDto: any,
  ) {
    return this.essayCriteriaService.updateEssayCriteria(id, updateCriteriaDto);
  }

  @Delete(':id')
  async deleteEssayCriteria(@Param('id') id: string) {
    return this.essayCriteriaService.deleteEssayCriteria(id);
  }
}
