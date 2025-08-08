import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { storage } from '../storage';

export interface StoredImage {
  id: string;
  originalUrl: string;
  localPath: string;
  filename: string;
  generationId: string;
  size: number;
  mimeType: string;
  hash: string;
  createdAt: Date;
}

export class ImageStorageService {
  private storageDir: string;
  private baseUrl: string;

  constructor() {
    this.storageDir = join(process.cwd(), 'stored-images');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory() {
    try {
      await access(this.storageDir);
    } catch {
      await mkdir(this.storageDir, { recursive: true });
    }
  }

  private generateHash(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return mimeToExt[mimeType] || '.png';
  }

  async downloadAndStoreImage(
    originalUrl: string, 
    generationId: string,
    metadata: { prompt?: string; model?: string } = {}
  ): Promise<StoredImage> {
    try {
      console.log(`Downloading image from: ${originalUrl}`);
      
      // Download the image
      const response = await fetch(originalUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get('content-type') || 'image/png';
      const hash = this.generateHash(imageBuffer);
      const extension = this.getFileExtension(mimeType);
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${hash.substring(0, 16)}_${timestamp}${extension}`;
      const localPath = join(this.storageDir, filename);

      // Save to local storage
      await writeFile(localPath, imageBuffer);

      const storedImage: StoredImage = {
        id: hash,
        originalUrl,
        localPath,
        filename,
        generationId,
        size: imageBuffer.length,
        mimeType,
        hash,
        createdAt: new Date(),
      };

      console.log(`Image stored successfully: ${filename}`);
      
      // Update generation record with local image info
      await storage.updateGeneration(generationId, {
        metadata: {
          ...(await storage.getGenerationsByUser('temp')).find(g => g.id === generationId)?.metadata,
          localImage: {
            filename,
            localPath: `/api/images/${filename}`,
            size: imageBuffer.length,
            hash,
          }
        }
      });

      return storedImage;
    } catch (error) {
      console.error('Error downloading and storing image:', error);
      throw error;
    }
  }

  async getStoredImage(filename: string): Promise<Buffer | null> {
    try {
      const filePath = join(this.storageDir, filename);
      return await readFile(filePath);
    } catch (error) {
      console.error('Error reading stored image:', error);
      return null;
    }
  }

  async downloadMultipleImages(
    urls: string[], 
    generationId: string,
    metadata: { prompt?: string; model?: string } = {}
  ): Promise<StoredImage[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.downloadAndStoreImage(url, generationId, metadata))
    );

    const successful: StoredImage[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push(urls[index]);
        console.error(`Failed to download image ${index + 1}:`, result.reason);
      }
    });

    if (failed.length > 0) {
      console.warn(`Failed to download ${failed.length} out of ${urls.length} images`);
    }

    return successful;
  }

  getLocalImageUrl(filename: string): string {
    return `${this.baseUrl}/api/images/${filename}`;
  }

  async processGenerationImages(generation: any): Promise<void> {
    if (!generation.result?.data) return;

    const urls = generation.result.data
      .map((item: any) => item.url)
      .filter((url: string) => url);

    if (urls.length === 0) return;

    try {
      const storedImages = await this.downloadMultipleImages(
        urls, 
        generation.id,
        {
          prompt: generation.prompt,
          model: generation.model
        }
      );

      // Update the generation result with local URLs
      const updatedData = generation.result.data.map((item: any, index: number) => {
        const storedImage = storedImages[index];
        return {
          ...item,
          localUrl: storedImage ? this.getLocalImageUrl(storedImage.filename) : undefined,
          localFilename: storedImage?.filename,
        };
      });

      await storage.updateGeneration(generation.id, {
        result: {
          ...generation.result,
          data: updatedData,
        }
      });

      console.log(`Processed ${storedImages.length} images for generation ${generation.id}`);
    } catch (error) {
      console.error('Error processing generation images:', error);
    }
  }

  async cleanupOldImages(daysOld: number = 30): Promise<void> {
    // Implementation for cleaning up old images
    // This would typically run as a scheduled job
    console.log(`Cleanup of images older than ${daysOld} days would run here`);
  }

  async getImageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    storageDir: string;
  }> {
    // Implementation for getting storage statistics
    return {
      totalImages: 0,
      totalSize: 0,
      storageDir: this.storageDir,
    };
  }
}

export const imageStorageService = new ImageStorageService();
