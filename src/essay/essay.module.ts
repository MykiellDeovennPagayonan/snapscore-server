import { Module } from '@nestjs/common';
import { EssayController } from './essay.controller';
import { EssayService } from './essay.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [EssayController],
  providers: [EssayService, UploadService],
})
export class EssayModule {}
