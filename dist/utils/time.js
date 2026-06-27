"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimeMMSS = getCurrentTimeMMSS;
exports.parseWorkingHours = parseWorkingHours;
function getCurrentTimeMMSS() {
    const now = new Date();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${minutes}:${seconds}`;
}
// Parse "HH:MM - HH:MM" (or "HH:MM – HH:MM") and return duration in hours
function parseWorkingHours(text) {
    const match = text.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
    if (!match)
        return null;
    const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
    let endMin = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (endMin <= startMin)
        endMin += 24 * 60; // crosses midnight
    return (endMin - startMin) / 60;
}
