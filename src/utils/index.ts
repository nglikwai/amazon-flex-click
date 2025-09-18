import robot from 'robotjs';

export function clickPosition(x: number, y: number): void {
  robot.moveMouse(x, y);
  robot.mouseClick();
  console.log(`Clicked at position (${x}, ${y})`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}