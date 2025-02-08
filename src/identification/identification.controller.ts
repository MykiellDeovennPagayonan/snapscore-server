import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdentificationService } from './identification.service';

@Controller('identification')
export class IdentificationController {
  constructor(private identificationService: IdentificationService) {}

  @Post(':assessmentId')
  @UseInterceptors(
    FileInterceptor('image', {
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
    @Param('assessmentId') assessmentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.identificationService.processIdentification(
      assessmentId,
      file,
    );
    return result;
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
}
