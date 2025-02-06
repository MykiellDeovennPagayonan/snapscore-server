import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EssayService } from './essay.service';

@Controller('essay')
export class EssayController {
  constructor(private essayService: EssayService) {}

  @Post(':assessmentId')
  @UseInterceptors(FileInterceptor('image'))
  async uploadEssayImage(
    @Param('assessmentId') assessmentId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.essayService.rateEssay(file, assessmentId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to process essay: ${error.message}`,
      );
    }
  }

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, callback) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  //       },
  //     }),
  //     fileFilter: (req, file, callback) => {
  //       if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
  //         return callback(
  //           new BadRequestException('Only image files are allowed!'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //   }),
  // )
  // async uploadImage(@UploadedFile() file) {
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded');
  //   }
  //   const rating: number = await this.essayService.rateEssay(file.filename);
  //   console.log(rating);
  //   return rating;
  // }
}
