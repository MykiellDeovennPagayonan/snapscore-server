import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class EssayService {
  private readonly logger = new Logger(EssayService.name);

  async convertImageToBase64(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'uploads', filename); // ✅ Fixed path to root
    try {
      // Check if the file exists
      await fs.access(filePath);
      this.logger.log(`Reading file: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      await fs.unlink(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
      return fileBuffer.toString('base64');
    } catch (error) {
      this.logger.error(`Error processing file ${filename}:`, error);
      throw new BadRequestException(
        `Failed to convert image to Base64: ${error.message}`,
      );
    }
  }
}
