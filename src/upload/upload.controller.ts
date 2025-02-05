import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadsService: UploadService) {}

  @Post(':path')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('path') path: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // Allow larger uploads, we'll compress them
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadsService.uploadFile(path, file);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Get(':path')
  async getFile(@Param('path') path: string) {
    await this.uploadsService.getFile(path); // Check if file exists
    const url = this.uploadsService.getFileUrl(path);

    return {
      statusCode: HttpStatus.OK,
      data: {
        url,
      },
    };
  }

  @Delete(':path')
  async deleteFile(@Param('path') path: string) {
    await this.uploadsService.deleteFile(path);

    return {
      statusCode: HttpStatus.OK,
      message: 'File deleted successfully',
    };
  }
}
