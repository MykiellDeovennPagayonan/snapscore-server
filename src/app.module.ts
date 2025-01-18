import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EssayModule } from './essay/essay.module';
import { IdentificationModule } from './identification/identification.module';

@Module({
  imports: [EssayModule, IdentificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
