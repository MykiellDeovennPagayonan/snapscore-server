// upload.dto.ts
class UploadFileDto {
  path: string;
}

// upload.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadsService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadsService.uploadFile(
      uploadFileDto.path,
      file,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: result,
    };
  }

  @Get()
  async getFile(@Body('path') path: string) {
    await this.uploadsService.getFile(path);
    const url = this.uploadsService.getFileUrl(path);

    return {
      statusCode: HttpStatus.OK,
      data: {
        url,
      },
    };
  }

  @Delete()
  async deleteFile(@Body('path') path: string) {
    await this.uploadsService.deleteFile(path);

    return {
      statusCode: HttpStatus.OK,
      message: 'File deleted successfully',
    };
  }
}
