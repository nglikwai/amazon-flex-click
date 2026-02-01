import { createWorker } from 'tesseract.js';

export class OCRService {
  private worker: any;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start initialization
    this.initializationPromise = this._initialize();
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('Initializing OCR worker...');

      // Create worker (new Tesseract.js v5 API - workers come pre-loaded)
      this.worker = await createWorker('eng');

      // Set runtime parameters
      await this.worker.setParameters({
        tessedit_pageseg_mode: '6', // Uniform block of text
        preserve_interword_spaces: '1',
        user_defined_dpi: '300' // Higher DPI for better recognition
      });

      this.isInitialized = true;
      console.log('OCR worker ready');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
      } catch (error) {
        console.error('Error cleaning up OCR worker:', error);
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async detectText(imageBuffer: Buffer): Promise<string> {
    await this.ensureInitialized();

    try {
      const { data: { text } } = await this.worker.recognize(imageBuffer);
      return text;
    } catch (error) {
      console.error('Error detecting text:', error);
      throw error;
    }
  }

  async detectNumbers(imageBuffer: Buffer): Promise<string> {
    await this.ensureInitialized();

    try {
      // Check if worker is still valid
      if (!this.worker) {
        console.log('Worker was null, re-initializing...');
        await this.initialize();
      }

      // Configure for numbers and currency only
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789.$,',
        tessedit_pageseg_mode: '8', // Single word - better for enhanced images
      });

      const { data: { text } } = await this.worker.recognize(imageBuffer);

      // Extract first number-like sequence and normalize it
      const raw = text || '';
      const match = raw.match(/[-+]?\$?\s*[0-9]+(?:[.,][0-9]+)*/);
      let numberStr = '';
      if (match) {
        numberStr = match[0].replace(/\s+/g, '').replace(/\$/g, '');
        // Normalize by removing thousands separators (commas)
        numberStr = numberStr.replace(/,/g, '');
      }

      // Reset to general text detection
      await this.worker.setParameters({
        tessedit_char_whitelist: '',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      return numberStr;
    } catch (error) {
      console.error('Error detecting numbers:', error);
      // Mark as not initialized so next call will re-init
      this.isInitialized = false;
      throw error;
    }
  }
}