/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EssayAssessmentService } from './essay-assessment.service';

@Controller('essay-assessment')
export class EssayAssessmentController {
  constructor(private essayService: EssayAssessmentService) {}

  @Get()
  async getAllEssayAssessments() {
    return this.essayService.getAllEssayAssessments();
  }

  @Get(':id')
  async getEssayAssessmentById(@Param('id') id: string) {
    return this.essayService.getEssayAssessmentById(id);
  }

  @Post()
  async createEssayAssessment(@Body() createDto: { name: string; userId: string }) {
    return this.essayService.createEssayAssessment(createDto);
  }

  @Put(':id')
  async updateEssayAssessment(@Param('id') id: string, @Body() updateDto: { name?: string }) {
    return this.essayService.updateEssayAssessment(id, updateDto);
  }

  @Delete(':id')
  async deleteEssayAssessment(@Param('id') id: string) {
    return this.essayService.deleteEssayAssessment(id);
  }

  @Get('user/:userId')
  async getAssessmentsByUser(@Param('userId') userId: string) {
    return this.essayService.getAllAssessmentsByUser(userId);
  }
}
