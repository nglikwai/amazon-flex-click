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
  pageTitleArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  signInButtonArea: {
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
  httpPort: number;
  httpUsername: string;
  httpPassword: string;
  amazonEmail: string;
  amazonPassword: string;
  menuButtonX: number;
  menuButtonY: number;
  settingButtonX: number;
  settingButtonY: number;
  logoutButtonX: number;
  logoutButtonY: number;
  confirmSignOutButtonX: number;
  confirmSignOutButtonY: number;
  usernameButtonX: number;
  usernameButtonY: number;
  passwordButtonX: number;
  passwordButtonY: number;
  signButtonX: number;
  signButtonY: number;
  offerButtonX: number;
  offerButtonY: number;
  notificationCloseButtonX: number;
  notificationCloseButtonY: number;
  justForYouArea: { x: number; y: number; width: number; height: number };
  justForYouSlotX: number;
  justForYouSlotY: number;
  justForYouDeclineX: number;
  justForYouDeclineY: number;
  justForYouConfirmDeclineX: number;
  justForYouConfirmDeclineY: number;
  justForYouCheckInterval: number;
}
