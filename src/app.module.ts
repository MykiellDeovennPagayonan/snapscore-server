import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EssayModule } from './essay/essay.module';
import { IdentificationModule } from './identification/identification.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { IdentificationQuestionsModule } from './identification-questions/identification-questions.module';
import { EssayQuestionsModule } from './essay-questions/essay-questions.module';
import { EssayCriteriaModule } from './essay-criteria/essay-criteria.module';
import { RubricsModule } from './rubrics/rubrics.module';
import { EssayResultsModule } from './essay-results/essay-results.module';
import { IdentificationResultsModule } from './identification-results/identification-results.module';

@Module({
  imports: [
    EssayModule,
    IdentificationModule,
    UsersModule,
    StudentsModule,
    AssessmentsModule,
    IdentificationQuestionsModule,
    EssayQuestionsModule,
    EssayCriteriaModule,
    RubricsModule,
    EssayResultsModule,
    IdentificationResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
