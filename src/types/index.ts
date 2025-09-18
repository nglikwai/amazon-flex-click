export interface Config {
  refreshButtonX: number;
  refreshButtonY: number;
  searchArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scheduleButtonX: number;
  scheduleButtonY: number;
  targetText: string;
  intervalMs: number;
}