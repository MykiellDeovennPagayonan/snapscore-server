import { Module } from '@nestjs/common';
import { IdentificationController } from './identification.controller';
import { IdentificationService } from './identification.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [IdentificationController],
  providers: [IdentificationService, UploadService],
})
export class IdentificationModule {}
