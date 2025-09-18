"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEarnings = parseEarnings;
exports.formatEarnings = formatEarnings;
function parseEarnings(text) {
    let maxEarnings = 0;
    // Find dollar amounts with $ symbol
    const dollarPattern = /\$(\d+(?:\.\d{2})?)/g;
    let match;
    while ((match = dollarPattern.exec(text)) !== null) {
        const earnings = parseFloat(match[1]);
        if (earnings > maxEarnings) {
            maxEarnings = earnings;
        }
    }
    // Also find plain numbers (like "66.00")
    const numberPattern = /(\d+\.\d{2})/g;
    while ((match = numberPattern.exec(text)) !== null) {
        const earnings = parseFloat(match[1]);
        if (earnings > maxEarnings) {
            maxEarnings = earnings;
        }
    }
    return maxEarnings;
}
function formatEarnings(amount) {
    return `$${amount.toFixed(2)}`;
}
