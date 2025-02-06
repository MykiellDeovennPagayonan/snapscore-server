import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EssayService } from './essay.service';

@Controller('essay')
export class EssayController {
  constructor(private essayService: EssayService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file,
    @Body('assessmentId') assessmentId: string,
    @Body('essayCriteria')
    essayCriteria: {
      criteria: string;
      maxScore: number;
      rubrics: { score: string; description: string };
    }[],
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return await this.essayService.rateEssay(
      file.filename,
      assessmentId,
      essayCriteria,
    );
  }
}
