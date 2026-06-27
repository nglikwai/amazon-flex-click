export interface Config {
  refreshButtonX: number;
  refreshButtonY: number;
  searchArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timeArea: {
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
  maxEarnings: number;
  minAvgEarningsPerHour: number;
  intervalMs: number;
  detailPageLoadMs: number;
  notificationEmail: string;
}
