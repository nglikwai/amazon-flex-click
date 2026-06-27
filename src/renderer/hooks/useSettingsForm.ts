import { useState, useEffect } from 'react';

export type FormState = {
  refreshButtonX: string;  refreshButtonY: string;
  scheduleButtonX: string; scheduleButtonY: string;
  searchAreaX: string;  searchAreaY: string;  searchAreaWidth: string;  searchAreaHeight: string;
  timeAreaX: string;    timeAreaY: string;    timeAreaWidth: string;    timeAreaHeight: string;
  appWindowX: string;   appWindowY: string;   appWindowWidth: string;   appWindowHeight: string;
  minEarnings: string;
  maxEarnings: string;
  minAvgEarningsPerHour: string;
  intervalMs: string;
  detailPageLoadMs: string;
  notificationEmail: string;
};

const EMPTY_FORM: FormState = {
  refreshButtonX: '',  refreshButtonY: '',
  scheduleButtonX: '', scheduleButtonY: '',
  searchAreaX: '',  searchAreaY: '',  searchAreaWidth: '',  searchAreaHeight: '',
  timeAreaX: '',    timeAreaY: '',    timeAreaWidth: '',    timeAreaHeight: '',
  appWindowX: '',   appWindowY: '',   appWindowWidth: '',   appWindowHeight: '',
  minEarnings: '', maxEarnings: '', minAvgEarningsPerHour: '',
  intervalMs: '', detailPageLoadMs: '',
  notificationEmail: '',
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
      minEarnings:          String(config.minEarnings),
      maxEarnings:          String(config.maxEarnings ?? 0),
      minAvgEarningsPerHour: String(config.minAvgEarningsPerHour ?? 0),
      intervalMs:           String(config.intervalMs || 500),
      detailPageLoadMs:     String(config.detailPageLoadMs),
      notificationEmail:    config.notificationEmail ?? '',
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
      minEarnings:           parseInt(form.minEarnings),
      maxEarnings:           parseInt(form.maxEarnings) || 0,
      minAvgEarningsPerHour: parseFloat(form.minAvgEarningsPerHour) || 0,
      intervalMs:            parseInt(form.intervalMs) || 500,
      detailPageLoadMs:      parseInt(form.detailPageLoadMs),
      notificationEmail:     form.notificationEmail.trim(),
    };

    const result = await window.electronAPI.saveConfig(config);
    if (result.success) onSaved(config.minEarnings, config.maxEarnings);
  }

  async function pickCoordinate(target: 'refreshButton' | 'scheduleButton') {
    const result = await window.electronAPI.pickCoordinate();
    if (!result) return;
    if (target === 'refreshButton') {
      setForm((p) => ({ ...p, refreshButtonX: String(result.x), refreshButtonY: String(result.y) }));
    } else {
      setForm((p) => ({ ...p, scheduleButtonX: String(result.x), scheduleButtonY: String(result.y) }));
    }
  }

  async function pickArea(target: 'searchArea' | 'timeArea' | 'appWindow') {
    const result = await window.electronAPI.pickArea();
    if (!result) return;
    const prefix = target === 'searchArea' ? 'searchArea'
                 : target === 'timeArea'   ? 'timeArea'
                 : 'appWindow';
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
