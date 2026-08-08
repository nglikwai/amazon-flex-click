import { useState, useEffect } from 'react';

export type FormState = {
  refreshButtonX: string;  refreshButtonY: string;
  scheduleButtonX: string; scheduleButtonY: string;
  searchAreaX: string;  searchAreaY: string;  searchAreaWidth: string;  searchAreaHeight: string;
  timeAreaX: string;    timeAreaY: string;    timeAreaWidth: string;    timeAreaHeight: string;
  appWindowX: string;       appWindowY: string;       appWindowWidth: string;       appWindowHeight: string;
  pageTitleAreaX: string;   pageTitleAreaY: string;   pageTitleAreaWidth: string;   pageTitleAreaHeight: string;
  signInButtonAreaX: string; signInButtonAreaY: string; signInButtonAreaWidth: string; signInButtonAreaHeight: string;
  minEarnings: string;
  maxEarnings: string;
  minAvgEarningsPerHour: string;
  intervalMs: string;
  detailPageLoadMs: string;
  notificationEmail: string;
  httpPort: string;
  httpUsername: string;
  httpPassword: string;
  menuButtonX: string;          menuButtonY: string;
  settingButtonX: string;       settingButtonY: string;
  logoutButtonX: string;        logoutButtonY: string;
  confirmSignOutButtonX: string; confirmSignOutButtonY: string;
  usernameButtonX: string;      usernameButtonY: string;
  passwordButtonX: string;      passwordButtonY: string;
  signButtonX: string;          signButtonY: string;
  offerButtonX: string;         offerButtonY: string;
  notificationCloseButtonX: string; notificationCloseButtonY: string;
  justForYouAreaX: string; justForYouAreaY: string; justForYouAreaWidth: string; justForYouAreaHeight: string;
  justForYouSlotX: string; justForYouSlotY: string;
  justForYouDeclineX: string; justForYouDeclineY: string;
  justForYouConfirmDeclineX: string; justForYouConfirmDeclineY: string;
  justForYouCheckInterval: string;
};

const EMPTY_FORM: FormState = {
  refreshButtonX: '',  refreshButtonY: '',
  scheduleButtonX: '', scheduleButtonY: '',
  searchAreaX: '',  searchAreaY: '',  searchAreaWidth: '',  searchAreaHeight: '',
  timeAreaX: '',    timeAreaY: '',    timeAreaWidth: '',    timeAreaHeight: '',
  appWindowX: '',       appWindowY: '',       appWindowWidth: '',       appWindowHeight: '',
  pageTitleAreaX: '',   pageTitleAreaY: '',   pageTitleAreaWidth: '',   pageTitleAreaHeight: '',
  signInButtonAreaX: '', signInButtonAreaY: '', signInButtonAreaWidth: '', signInButtonAreaHeight: '',
  minEarnings: '', maxEarnings: '', minAvgEarningsPerHour: '',
  intervalMs: '', detailPageLoadMs: '',
  notificationEmail: '',
  httpPort: '',
  httpUsername: '',
  httpPassword: '',
  menuButtonX: '',              menuButtonY: '',
  settingButtonX: '',           settingButtonY: '',
  logoutButtonX: '',            logoutButtonY: '',
  confirmSignOutButtonX: '',    confirmSignOutButtonY: '',
  usernameButtonX: '',          usernameButtonY: '',
  passwordButtonX: '',          passwordButtonY: '',
  signButtonX: '',              signButtonY: '',
  offerButtonX: '',             offerButtonY: '',
  notificationCloseButtonX: '', notificationCloseButtonY: '',
  justForYouAreaX: '', justForYouAreaY: '', justForYouAreaWidth: '', justForYouAreaHeight: '',
  justForYouSlotX: '', justForYouSlotY: '',
  justForYouDeclineX: '', justForYouDeclineY: '',
  justForYouConfirmDeclineX: '', justForYouConfirmDeclineY: '',
  justForYouCheckInterval: '10',
};

export function useSettingsForm(onSaved: (minEarnings: number, maxEarnings: number) => void) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [showPermissionsNotice, setShowPermissionsNotice] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    loadSettings();
    checkPermissions();
    const interval = setInterval(updateMousePosition, 100);
    updateMousePosition();
    return () => clearInterval(interval);
  }, []);

  async function updateMousePosition() {
    try {
      const pos = await window.electronAPI.getMousePosition();
      setMouseX(pos.x);
      setMouseY(pos.y);
    } catch { /* ignore */ }
  }

  async function checkPermissions() {
    try {
      const p = await window.electronAPI.checkPermissions();
      setShowPermissionsNotice(p.needsPermissions);
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  }

  async function loadSettings() {
    const config = await window.electronAPI.getConfig();
    if (!config) return;
    setForm({
      refreshButtonX:       String(config.refreshButtonX),
      refreshButtonY:       String(config.refreshButtonY),
      scheduleButtonX:      String(config.scheduleButtonX),
      scheduleButtonY:      String(config.scheduleButtonY),
      searchAreaX:          String(config.searchArea.x),
      searchAreaY:          String(config.searchArea.y),
      searchAreaWidth:      String(config.searchArea.width),
      searchAreaHeight:     String(config.searchArea.height),
      timeAreaX:            String(config.timeArea?.x ?? ''),
      timeAreaY:            String(config.timeArea?.y ?? ''),
      timeAreaWidth:        String(config.timeArea?.width ?? ''),
      timeAreaHeight:       String(config.timeArea?.height ?? ''),
      appWindowX:           String(config.appWindow.x),
      appWindowY:           String(config.appWindow.y),
      appWindowWidth:       String(config.appWindow.width),
      appWindowHeight:      String(config.appWindow.height),
      pageTitleAreaX:       String(config.pageTitleArea?.x ?? 0),
      pageTitleAreaY:       String(config.pageTitleArea?.y ?? 0),
      pageTitleAreaWidth:   String(config.pageTitleArea?.width ?? 0),
      pageTitleAreaHeight:  String(config.pageTitleArea?.height ?? 0),
      signInButtonAreaX:    String(config.signInButtonArea?.x ?? 0),
      signInButtonAreaY:    String(config.signInButtonArea?.y ?? 0),
      signInButtonAreaWidth:  String(config.signInButtonArea?.width ?? 0),
      signInButtonAreaHeight: String(config.signInButtonArea?.height ?? 0),
      minEarnings:          String(config.minEarnings),
      maxEarnings:          String(config.maxEarnings ?? 0),
      minAvgEarningsPerHour: String(config.minAvgEarningsPerHour ?? 0),
      intervalMs:           String(config.intervalMs || 500),
      detailPageLoadMs:     String(config.detailPageLoadMs),
      notificationEmail:    config.notificationEmail ?? '',
      httpPort:             String(config.httpPort ?? 3456),
      httpUsername:         config.httpUsername ?? '',
      httpPassword:         config.httpPassword ?? '',
      menuButtonX:          String(config.menuButtonX ?? 0),
      menuButtonY:          String(config.menuButtonY ?? 0),
      settingButtonX:       String(config.settingButtonX ?? 0),
      settingButtonY:       String(config.settingButtonY ?? 0),
      logoutButtonX:        String(config.logoutButtonX ?? 0),
      logoutButtonY:        String(config.logoutButtonY ?? 0),
      confirmSignOutButtonX: String(config.confirmSignOutButtonX ?? 0),
      confirmSignOutButtonY: String(config.confirmSignOutButtonY ?? 0),
      usernameButtonX:      String(config.usernameButtonX ?? 0),
      usernameButtonY:      String(config.usernameButtonY ?? 0),
      passwordButtonX:      String(config.passwordButtonX ?? 0),
      passwordButtonY:      String(config.passwordButtonY ?? 0),
      signButtonX:          String(config.signButtonX ?? 0),
      signButtonY:          String(config.signButtonY ?? 0),
      offerButtonX:         String(config.offerButtonX ?? 0),
      offerButtonY:         String(config.offerButtonY ?? 0),
      notificationCloseButtonX: String(config.notificationCloseButtonX ?? 0),
      notificationCloseButtonY: String(config.notificationCloseButtonY ?? 0),
      justForYouAreaX:      String(config.justForYouArea?.x ?? 0),
      justForYouAreaY:      String(config.justForYouArea?.y ?? 0),
      justForYouAreaWidth:  String(config.justForYouArea?.width ?? 0),
      justForYouAreaHeight: String(config.justForYouArea?.height ?? 0),
      justForYouSlotX:      String(config.justForYouSlotX ?? 0),
      justForYouSlotY:      String(config.justForYouSlotY ?? 0),
      justForYouDeclineX:          String(config.justForYouDeclineX ?? 0),
      justForYouDeclineY:          String(config.justForYouDeclineY ?? 0),
      justForYouConfirmDeclineX:   String(config.justForYouConfirmDeclineX ?? 0),
      justForYouConfirmDeclineY:   String(config.justForYouConfirmDeclineY ?? 0),
      justForYouCheckInterval: String(config.justForYouCheckInterval ?? 10),
    });
  }

  async function save() {
    const config = {
      refreshButtonX:  parseInt(form.refreshButtonX),
      refreshButtonY:  parseInt(form.refreshButtonY),
      scheduleButtonX: parseInt(form.scheduleButtonX),
      scheduleButtonY: parseInt(form.scheduleButtonY),
      searchArea: {
        x:      parseInt(form.searchAreaX),
        y:      parseInt(form.searchAreaY),
        width:  parseInt(form.searchAreaWidth),
        height: parseInt(form.searchAreaHeight),
      },
      timeArea: {
        x:      parseInt(form.timeAreaX) || 0,
        y:      parseInt(form.timeAreaY) || 0,
        width:  parseInt(form.timeAreaWidth) || 0,
        height: parseInt(form.timeAreaHeight) || 0,
      },
      appWindow: {
        x:      parseInt(form.appWindowX),
        y:      parseInt(form.appWindowY),
        width:  parseInt(form.appWindowWidth),
        height: parseInt(form.appWindowHeight),
      },
      pageTitleArea: {
        x:      parseInt(form.pageTitleAreaX) || 0,
        y:      parseInt(form.pageTitleAreaY) || 0,
        width:  parseInt(form.pageTitleAreaWidth) || 0,
        height: parseInt(form.pageTitleAreaHeight) || 0,
      },
      signInButtonArea: {
        x:      parseInt(form.signInButtonAreaX) || 0,
        y:      parseInt(form.signInButtonAreaY) || 0,
        width:  parseInt(form.signInButtonAreaWidth) || 0,
        height: parseInt(form.signInButtonAreaHeight) || 0,
      },
      minEarnings:           parseInt(form.minEarnings),
      maxEarnings:           parseInt(form.maxEarnings) || 0,
      minAvgEarningsPerHour: parseFloat(form.minAvgEarningsPerHour) || 0,
      intervalMs:            parseInt(form.intervalMs) || 500,
      detailPageLoadMs:      parseInt(form.detailPageLoadMs),
      notificationEmail:     form.notificationEmail.trim(),
      httpPort:              parseInt(form.httpPort) || 3456,
      httpUsername:          form.httpUsername.trim(),
      httpPassword:          form.httpPassword,
      menuButtonX:           parseInt(form.menuButtonX) || 0,
      menuButtonY:           parseInt(form.menuButtonY) || 0,
      settingButtonX:        parseInt(form.settingButtonX) || 0,
      settingButtonY:        parseInt(form.settingButtonY) || 0,
      logoutButtonX:         parseInt(form.logoutButtonX) || 0,
      logoutButtonY:         parseInt(form.logoutButtonY) || 0,
      confirmSignOutButtonX: parseInt(form.confirmSignOutButtonX) || 0,
      confirmSignOutButtonY: parseInt(form.confirmSignOutButtonY) || 0,
      usernameButtonX:       parseInt(form.usernameButtonX) || 0,
      usernameButtonY:       parseInt(form.usernameButtonY) || 0,
      passwordButtonX:       parseInt(form.passwordButtonX) || 0,
      passwordButtonY:       parseInt(form.passwordButtonY) || 0,
      signButtonX:           parseInt(form.signButtonX) || 0,
      signButtonY:           parseInt(form.signButtonY) || 0,
      offerButtonX:          parseInt(form.offerButtonX) || 0,
      offerButtonY:          parseInt(form.offerButtonY) || 0,
      notificationCloseButtonX: parseInt(form.notificationCloseButtonX) || 0,
      notificationCloseButtonY: parseInt(form.notificationCloseButtonY) || 0,
      justForYouArea: {
        x:      parseInt(form.justForYouAreaX) || 0,
        y:      parseInt(form.justForYouAreaY) || 0,
        width:  parseInt(form.justForYouAreaWidth) || 0,
        height: parseInt(form.justForYouAreaHeight) || 0,
      },
      justForYouSlotX:          parseInt(form.justForYouSlotX) || 0,
      justForYouSlotY:          parseInt(form.justForYouSlotY) || 0,
      justForYouDeclineX:          parseInt(form.justForYouDeclineX) || 0,
      justForYouDeclineY:          parseInt(form.justForYouDeclineY) || 0,
      justForYouConfirmDeclineX:   parseInt(form.justForYouConfirmDeclineX) || 0,
      justForYouConfirmDeclineY:   parseInt(form.justForYouConfirmDeclineY) || 0,
      justForYouCheckInterval:  parseInt(form.justForYouCheckInterval) || 10,
    };

    const result = await window.electronAPI.saveConfig(config);
    if (result.success) onSaved(config.minEarnings, config.maxEarnings);
  }

  async function pickCoordinate(target: 'refreshButton' | 'scheduleButton' | 'menuButton' | 'settingButton' | 'logoutButton' | 'confirmSignOutButton' | 'usernameButton' | 'passwordButton' | 'signButton' | 'offerButton' | 'notificationCloseButton' | 'justForYouSlot' | 'justForYouDecline' | 'justForYouConfirmDecline') {
    const result = await window.electronAPI.pickCoordinate();
    if (!result) return;
    setForm((p) => ({ ...p, [`${target}X`]: String(result.x), [`${target}Y`]: String(result.y) }));
  }

  async function pickArea(target: 'searchArea' | 'timeArea' | 'appWindow' | 'pageTitleArea' | 'signInButtonArea' | 'justForYouArea') {
    const result = await window.electronAPI.pickArea();
    if (!result) return;
    const prefix = target;
    setForm((p) => ({
      ...p,
      [`${prefix}X`]:      String(result.x),
      [`${prefix}Y`]:      String(result.y),
      [`${prefix}Width`]:  String(result.width),
      [`${prefix}Height`]: String(result.height),
    }));
  }

  return { form, setField, mouseX, mouseY, showPermissionsNotice, save, pickCoordinate, pickArea };
}
