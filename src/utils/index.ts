import robot from 'robotjs';

export function clickPosition(x: number, y: number): void {
  robot.moveMouse(x, y);
  robot.mouseClick();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { DisplayManager } from './display';
export type { DisplayInfo } from './display';