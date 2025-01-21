import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { StudentsController } from './students/students.controller';
import { StudentsModule } from './students/students.module';

@Module({
  controllers: [AssessmentsController, StudentsController],
  providers: [AssessmentsService],
  imports: [StudentsModule],
})
export class AssessmentsModule {}
