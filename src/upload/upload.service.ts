import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private readonly MAX_SIZE = 1024 * 1024; // 1MB
  private readonly MIN_SIZE = 500 * 1024; // 500KB

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION_NEST,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_NEST_KEY,
        secretAccessKey: process.env.AWS_SECRET_NEST_KEY,
      },
    });
    this.bucket = process.env.AWS_BUCKET_NEST_NAME;
  }

  private sanitizeFileName(fileName: string): string {
    // Remove spaces and special characters, replace with hyphens
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      // Add more mime types as needed
    };
    return mimeToExt[mimeType] || '.jpg';
  }

  private async compressImage(buffer: Buffer, mime: string): Promise<Buffer> {
    try {
      if (mime === 'image/gif') {
        return buffer;
      }

      let compressedImage = await sharp(buffer)
        .jpeg({
          quality: 80,
          chromaSubsampling: '4:4:4',
        })
        .toBuffer();

      if (compressedImage.length > this.MAX_SIZE) {
        compressedImage = await sharp(buffer)
          .jpeg({
            quality: 60,
            chromaSubsampling: '4:2:0',
          })
          .toBuffer();
      }

      return compressedImage;
    } catch (error) {
      console.error('Image compression error:', error);
      throw new BadRequestException(
        `Image compression failed: ${error.message}`,
      );
    }
  }

  async uploadFile(path: string, file: Express.Multer.File) {
    try {
      // Sanitize the path and add proper extension
      const fileExtension = this.getFileExtension(file.mimetype);
      const sanitizedPath = this.sanitizeFileName(path);
      const finalPath = sanitizedPath.endsWith(fileExtension)
        ? sanitizedPath
        : `${sanitizedPath}${fileExtension}`;

      let processedBuffer: Buffer;
      let contentType = file.mimetype;

      if (file.mimetype.startsWith('image/')) {
        processedBuffer = await this.compressImage(file.buffer, file.mimetype);
        // Update content type for compressed images (except GIFs)
        if (file.mimetype !== 'image/gif') {
          contentType = 'image/jpeg';
        }
      } else {
        processedBuffer = file.buffer;
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: finalPath,
        Body: processedBuffer,
        ContentType: contentType,
        Metadata: {
          'original-name': file.originalname,
          'content-type': contentType,
        },
      });

      await this.s3Client.send(command);

      return {
        path: finalPath,
        url: this.getFileUrl(finalPath),
        size: processedBuffer.length,
        type: contentType,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(path: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(path: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      throw new NotFoundException('File not found or already deleted');
    }
  }

  getFileUrl(path: string) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
  }
}
