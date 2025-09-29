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
  appWindow: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minEarnings: number;
  intervalMs: number;
  detailPageLoadMs: number;
}
