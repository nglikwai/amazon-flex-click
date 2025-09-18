import { createWorker } from 'tesseract.js';

export class OCRService {
  private worker: any;

  async initialize(): Promise<void> {
    console.log('Initializing OCR worker...');
    this.worker = await createWorker('eng');

    // Default configuration for general text detection
    await this.worker.setParameters({
      tessedit_pageseg_mode: 6, // Uniform block of text
      tessedit_ocr_engine_mode: 1, // LSTM OCR engine only
      preserve_interword_spaces: 1,
      user_defined_dpi: 300 // Higher DPI for better recognition
    });

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

  async detectNumbers(imageBuffer: Buffer): Promise<string> {
    // Configure for numbers and currency only
    await this.worker.setParameters({
      tessedit_char_whitelist: '0123456789.$',
      tessedit_pageseg_mode: 8, // Single word - better for enhanced images
    });

    const { data: { text } } = await this.worker.recognize(imageBuffer);

    // Reset to general text detection
    await this.worker.setParameters({
      tessedit_char_whitelist: '',
      tessedit_pageseg_mode: 6, // Uniform block of text
    });

    return text;
  }
}