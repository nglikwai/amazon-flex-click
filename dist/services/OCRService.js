"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const tesseract_js_1 = require("tesseract.js");
class OCRService {
    async initialize() {
        console.log('Initializing OCR worker...');
        this.worker = await (0, tesseract_js_1.createWorker)('eng');
        // Default configuration for general text detection
        await this.worker.setParameters({
            tessedit_pageseg_mode: 6, // Uniform block of text
            tessedit_ocr_engine_mode: 1, // LSTM OCR engine only
            preserve_interword_spaces: 1,
            user_defined_dpi: 300 // Higher DPI for better recognition
        });
        console.log('OCR worker ready');
    }
    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
        }
    }
    async detectText(imageBuffer) {
        const { data: { text } } = await this.worker.recognize(imageBuffer);
        return text;
    }
    async detectNumbers(imageBuffer) {
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
exports.OCRService = OCRService;
