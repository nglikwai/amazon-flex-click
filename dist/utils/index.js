"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayManager = void 0;
exports.clickPosition = clickPosition;
exports.sleep = sleep;
const robotjs_1 = __importDefault(require("robotjs"));
function clickPosition(x, y) {
    robotjs_1.default.moveMouse(x, y);
    robotjs_1.default.mouseClick();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var display_1 = require("./display");
Object.defineProperty(exports, "DisplayManager", { enumerable: true, get: function () { return display_1.DisplayManager; } });
