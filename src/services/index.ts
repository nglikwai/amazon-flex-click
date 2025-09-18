import screenshot from 'screenshot-desktop';
import { createWorker } from 'tesseract.js';

export class ScreenshotService {
  static async takeScreenshot(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      screenshot({ format: 'png' }).then((img: Buffer) => {
        resolve(img);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}

export class OCRService {
  private worker: any;

  async initialize(): Promise<void> {
    console.log('Initializing OCR worker...');
    this.worker = await createWorker('eng');
    console.log('OCR worker ready');
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
    }
  }

  async detectText(imageBuffer: Buffer): Promise<string> {
    const { data: { text } } = await this.worker.recognize(imageBuffer);
    return text;
  }
}