import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  async getAllStudents() {
    return this.studentsService.getAllStudents();
  }

  @Get(':id')
  async getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(id);
  }

  @Post()
  async createStudent(@Body() createStudentDto: any) {
    return this.studentsService.createStudent(createStudentDto);
  }

  @Put(':id')
  async updateStudent(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  async deleteStudent(@Param('id') id: string) {
    return this.studentsService.deleteStudent(id);
  }

  @Get('user/:userId')
  async getStudentsByUserId(@Param('userId') userId: string) {
    return this.studentsService.getStudentsByUserId(userId);
  }
}
