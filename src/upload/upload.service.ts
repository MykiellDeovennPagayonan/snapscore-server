// uploads.service.ts
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
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.bucket = process.env.AWS_BUCKET_NAME;
  }

  private async compressImage(buffer: Buffer, mime: string): Promise<Buffer> {
    let quality = 80; // Start with 80% quality
    let compressed = buffer;
    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      let sharpInstance = sharp(buffer);

      // Convert all images to JPEG for better compression
      if (mime !== 'image/gif') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else {
        // For GIFs, we'll keep the format but reduce colors if needed
        sharpInstance = sharpInstance.gif();
      }

      compressed = await sharpInstance
        .withMetadata() // Preserve metadata
        .toBuffer();

      const size = compressed.length;

      // If size is in desired range, return the buffer
      if (size >= this.MIN_SIZE && size <= this.MAX_SIZE) {
        break;
      }

      // Adjust quality based on size
      if (size > this.MAX_SIZE) {
        quality = Math.max(quality - 10, 30); // Don't go below 30% quality
      } else if (size < this.MIN_SIZE) {
        // If smaller than target, use the current version
        break;
      }

      attempt++;
    }

    return compressed;
  }

  async uploadFile(path: string, file: Express.Multer.File) {
    try {
      // Compress the image
      const compressedBuffer = await this.compressImage(
        file.buffer,
        file.mimetype,
      );

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: compressedBuffer,
        ContentType:
          file.mimetype !== 'image/gif' ? 'image/jpeg' : file.mimetype,
      });

      await this.s3Client.send(command);

      return {
        path,
        url: this.getFileUrl(path),
        size: compressedBuffer.length,
      };
    } catch (error) {
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
