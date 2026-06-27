import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface SettingsViewProps {
  onSave: (minEarnings: number, maxEarnings: number) => void;
  onMousePosition?: (x: number, y: number) => void;
}

export interface SettingsViewRef {
  saveSettings: () => Promise<void>;
  mouseX: number;
  mouseY: number;
}

const SettingsView = forwardRef<SettingsViewRef, SettingsViewProps>(({ onSave, onMousePosition }, ref) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [showPermissionsNotice, setShowPermissionsNotice] = useState(false);

  // Form fields
  const [refreshButtonX, setRefreshButtonX] = useState('');
  const [refreshButtonY, setRefreshButtonY] = useState('');
  const [scheduleButtonX, setScheduleButtonX] = useState('');
  const [scheduleButtonY, setScheduleButtonY] = useState('');
  const [searchAreaX, setSearchAreaX] = useState('');
  const [searchAreaY, setSearchAreaY] = useState('');
  const [searchAreaWidth, setSearchAreaWidth] = useState('');
  const [searchAreaHeight, setSearchAreaHeight] = useState('');
  const [timeAreaX, setTimeAreaX] = useState('');
  const [timeAreaY, setTimeAreaY] = useState('');
  const [timeAreaWidth, setTimeAreaWidth] = useState('');
  const [timeAreaHeight, setTimeAreaHeight] = useState('');
  const [appWindowX, setAppWindowX] = useState('');
  const [appWindowY, setAppWindowY] = useState('');
  const [appWindowWidth, setAppWindowWidth] = useState('');
  const [appWindowHeight, setAppWindowHeight] = useState('');
  const [minEarnings, setMinEarnings] = useState('');
  const [maxEarnings, setMaxEarnings] = useState('');
  const [minAvgEarningsPerHour, setMinAvgEarningsPerHour] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [intervalMs, setIntervalMs] = useState('');
  const [detailPageLoadMs, setDetailPageLoadMs] = useState('');

  useEffect(() => {
    loadSettings();
    checkPermissions();
    const interval = setInterval(updateMousePosition, 100);
    updateMousePosition();
    return () => clearInterval(interval);
  }, []);

  const updateMousePosition = async () => {
    try {
      const pos = await window.electronAPI.getMousePosition();
      setMouseX(pos.x);
      setMouseY(pos.y);
      if (onMousePosition) {
        onMousePosition(pos.x, pos.y);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const checkPermissions = async () => {
    try {
      const permissions = await window.electronAPI.checkPermissions();
      setShowPermissionsNotice(permissions.needsPermissions);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const loadSettings = async () => {
    const config = await window.electronAPI.getConfig();
    if (config) {
      setRefreshButtonX(config.refreshButtonX);
      setRefreshButtonY(config.refreshButtonY);
      setScheduleButtonX(config.scheduleButtonX);
      setScheduleButtonY(config.scheduleButtonY);
      setSearchAreaX(config.searchArea.x);
      setSearchAreaY(config.searchArea.y);
      setSearchAreaWidth(config.searchArea.width);
      setSearchAreaHeight(config.searchArea.height);
      setTimeAreaX(config.timeArea?.x ?? '');
      setTimeAreaY(config.timeArea?.y ?? '');
      setTimeAreaWidth(config.timeArea?.width ?? '');
      setTimeAreaHeight(config.timeArea?.height ?? '');
      setAppWindowX(config.appWindow.x);
      setAppWindowY(config.appWindow.y);
      setAppWindowWidth(config.appWindow.width);
      setAppWindowHeight(config.appWindow.height);
      setMinEarnings(config.minEarnings);
      setMaxEarnings(config.maxEarnings ?? 0);
      setMinAvgEarningsPerHour(config.minAvgEarningsPerHour ?? 0);
      setNotificationEmail(config.notificationEmail ?? '');
      setIntervalMs(config.intervalMs || 500);
      setDetailPageLoadMs(config.detailPageLoadMs);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const config = {
      refreshButtonX: parseInt(refreshButtonX),
      refreshButtonY: parseInt(refreshButtonY),
      scheduleButtonX: parseInt(scheduleButtonX),
      scheduleButtonY: parseInt(scheduleButtonY),
      searchArea: {
        x: parseInt(searchAreaX),
        y: parseInt(searchAreaY),
        width: parseInt(searchAreaWidth),
        height: parseInt(searchAreaHeight),
      },
      timeArea: {
        x: parseInt(timeAreaX) || 0,
        y: parseInt(timeAreaY) || 0,
        width: parseInt(timeAreaWidth) || 0,
        height: parseInt(timeAreaHeight) || 0,
      },
      appWindow: {
        x: parseInt(appWindowX),
        y: parseInt(appWindowY),
        width: parseInt(appWindowWidth),
        height: parseInt(appWindowHeight),
      },
      minEarnings: parseInt(minEarnings),
      maxEarnings: parseInt(maxEarnings) || 0,
      minAvgEarningsPerHour: parseFloat(minAvgEarningsPerHour) || 0,
      intervalMs: parseInt(intervalMs) || 500,
      detailPageLoadMs: parseInt(detailPageLoadMs),
      notificationEmail: notificationEmail.trim(),
    };

    const result = await window.electronAPI.saveConfig(config);
    if (result.success) {
      onSave(config.minEarnings, config.maxEarnings);
    }
  };

  useImperativeHandle(ref, () => ({
    saveSettings: handleSaveSettings,
    mouseX,
    mouseY,
  }));

  const handlePickCoordinate = async (target: string) => {
    try {
      const result = await window.electronAPI.pickCoordinate();
      if (result) {
        if (target === 'refreshButton') {
          setRefreshButtonX(result.x.toString());
          setRefreshButtonY(result.y.toString());
        } else if (target === 'scheduleButton') {
          setScheduleButtonX(result.x.toString());
          setScheduleButtonY(result.y.toString());
        }
      }
    } catch (error) {
      console.error('Error picking coordinate:', error);
    }
  };

  const handlePickArea = async (target: string) => {
    try {
      const result = await window.electronAPI.pickArea();
      if (result) {
        if (target === 'searchArea') {
          setSearchAreaX(result.x.toString());
          setSearchAreaY(result.y.toString());
          setSearchAreaWidth(result.width.toString());
          setSearchAreaHeight(result.height.toString());
        } else if (target === 'timeArea') {
          setTimeAreaX(result.x.toString());
          setTimeAreaY(result.y.toString());
          setTimeAreaWidth(result.width.toString());
          setTimeAreaHeight(result.height.toString());
        } else if (target === 'appWindow') {
          setAppWindowX(result.x.toString());
          setAppWindowY(result.y.toString());
          setAppWindowWidth(result.width.toString());
          setAppWindowHeight(result.height.toString());
        }
      }
    } catch (error) {
      console.error('Error picking area:', error);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-gh-bg border border-gh-border rounded-md text-gh-text text-sm focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const labelClass = "block text-sm font-medium text-gh-text-secondary mb-1.5";
  const sectionTitleClass = "text-sm font-semibold text-gh-accent mb-3";

  return (
    <div className="w-full max-w-3xl mx-auto h-full overflow-y-auto py-4">
      <div className="bg-gh-bg-secondary border border-gh-border rounded-lg p-6 shadow-lg">
        {showPermissionsNotice && (
          <div className="bg-gh-warning/10 border-2 border-gh-warning rounded-lg p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="flex-1">
              <strong className="block text-gh-warning font-semibold mb-1">Permissions Required</strong>
              <p className="text-gh-text-secondary text-sm mb-3">
                This app needs Accessibility permissions to control mouse clicks.
              </p>
              <button
                type="button"
                className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white text-sm font-medium rounded-md transition-colors"
                onClick={() => window.electronAPI.openSystemPreferences()}
              >
                Open System Preferences
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className={sectionTitleClass}>Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minEarnings" className={labelClass}>Minimum Earnings ($)</label>
                <input
                  type="number"
                  id="minEarnings"
                  value={minEarnings}
                  onChange={(e) => setMinEarnings(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="maxEarnings" className={labelClass}>Maximum Earnings ($) <span className="text-gh-text-muted font-normal">(0 = no limit)</span></label>
                <input
                  type="number"
                  id="maxEarnings"
                  value={maxEarnings}
                  onChange={(e) => setMaxEarnings(e.target.value)}
                  className={inputClass}
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="minAvgEarningsPerHour" className={labelClass}>Min Avg Earnings/hr ($) <span className="text-gh-text-muted font-normal">(0 = no limit)</span></label>
                <input
                  type="number"
                  id="minAvgEarningsPerHour"
                  value={minAvgEarningsPerHour}
                  onChange={(e) => setMinAvgEarningsPerHour(e.target.value)}
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="notificationEmail" className={labelClass}>Notification Email <span className="text-gh-text-muted font-normal">(leave blank to disable)</span></label>
                <input
                  type="email"
                  id="notificationEmail"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="intervalMs" className={labelClass}>Refresh Interval (ms)</label>
                <input
                  type="number"
                  id="intervalMs"
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="detailPageLoadMs" className={labelClass}>Detail Page Load (ms)</label>
                <input
                  type="number"
                  id="detailPageLoadMs"
                  value={detailPageLoadMs}
                  onChange={(e) => setDetailPageLoadMs(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Button Positions */}
          <div>
            <h3 className={sectionTitleClass}>Button Positions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="refreshButtonX" className={labelClass}>Refresh Button X</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="refreshButtonX"
                    value={refreshButtonX}
                    onChange={(e) => setRefreshButtonX(e.target.value)}
                    className={`${inputClass} flex-1`}
                    required
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-md transition-colors flex items-center justify-center"
                    onClick={() => handlePickCoordinate('refreshButton')}
                    title="Pick position"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7h14"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="refreshButtonY" className={labelClass}>Refresh Button Y</label>
                <input
                  type="number"
                  id="refreshButtonY"
                  value={refreshButtonY}
                  onChange={(e) => setRefreshButtonY(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="scheduleButtonX" className={labelClass}>Schedule Button X</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="scheduleButtonX"
                    value={scheduleButtonX}
                    onChange={(e) => setScheduleButtonX(e.target.value)}
                    className={`${inputClass} flex-1`}
                    required
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-md transition-colors flex items-center justify-center"
                    onClick={() => handlePickCoordinate('scheduleButton')}
                    title="Pick position"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7h14"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="scheduleButtonY" className={labelClass}>Schedule Button Y</label>
                <input
                  type="number"
                  id="scheduleButtonY"
                  value={scheduleButtonY}
                  onChange={(e) => setScheduleButtonY(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Search Area */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gh-accent">Search Area</h3>
              <button
                type="button"
                className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                onClick={() => handlePickArea('searchArea')}
                title="Pick area (2 clicks)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8m-4-4h8"/>
                </svg>
                <span>Pick Area</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="searchAreaX" className={labelClass}>Top-Left X</label>
                <input
                  type="number"
                  id="searchAreaX"
                  value={searchAreaX}
                  onChange={(e) => setSearchAreaX(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="searchAreaY" className={labelClass}>Top-Left Y</label>
                <input
                  type="number"
                  id="searchAreaY"
                  value={searchAreaY}
                  onChange={(e) => setSearchAreaY(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="searchAreaWidth" className={labelClass}>Width</label>
                <input
                  type="number"
                  id="searchAreaWidth"
                  value={searchAreaWidth}
                  onChange={(e) => setSearchAreaWidth(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="searchAreaHeight" className={labelClass}>Height</label>
                <input
                  type="number"
                  id="searchAreaHeight"
                  value={searchAreaHeight}
                  onChange={(e) => setSearchAreaHeight(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Time Area */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gh-accent">Time Area</h3>
              <button
                type="button"
                className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                onClick={() => handlePickArea('timeArea')}
                title="Pick area (2 clicks)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8m-4-4h8"/>
                </svg>
                <span>Pick Area</span>
              </button>
            </div>
            <p className="text-xs text-gh-text-muted mb-3">Region containing the working time (e.g. 17:15 - 21:15). Used to calculate average earnings per hour.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeAreaX" className={labelClass}>Top-Left X</label>
                <input
                  type="number"
                  id="timeAreaX"
                  value={timeAreaX}
                  onChange={(e) => setTimeAreaX(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="timeAreaY" className={labelClass}>Top-Left Y</label>
                <input
                  type="number"
                  id="timeAreaY"
                  value={timeAreaY}
                  onChange={(e) => setTimeAreaY(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="timeAreaWidth" className={labelClass}>Width</label>
                <input
                  type="number"
                  id="timeAreaWidth"
                  value={timeAreaWidth}
                  onChange={(e) => setTimeAreaWidth(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="timeAreaHeight" className={labelClass}>Height</label>
                <input
                  type="number"
                  id="timeAreaHeight"
                  value={timeAreaHeight}
                  onChange={(e) => setTimeAreaHeight(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* App Window */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gh-accent">App Window</h3>
              <button
                type="button"
                className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                onClick={() => handlePickArea('appWindow')}
                title="Pick area (2 clicks)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8m-4-4h8"/>
                </svg>
                <span>Pick Area</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="appWindowX" className={labelClass}>Top-Left X</label>
                <input
                  type="number"
                  id="appWindowX"
                  value={appWindowX}
                  onChange={(e) => setAppWindowX(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="appWindowY" className={labelClass}>Top-Left Y</label>
                <input
                  type="number"
                  id="appWindowY"
                  value={appWindowY}
                  onChange={(e) => setAppWindowY(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="appWindowWidth" className={labelClass}>Width</label>
                <input
                  type="number"
                  id="appWindowWidth"
                  value={appWindowWidth}
                  onChange={(e) => setAppWindowWidth(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="appWindowHeight" className={labelClass}>Height</label>
                <input
                  type="number"
                  id="appWindowHeight"
                  value={appWindowHeight}
                  onChange={(e) => setAppWindowHeight(e.target.value)}
                  className={`${inputClass} bg-gh-bg-tertiary`}
                  required
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Debug Screenshots */}
          <div>
            <h3 className={sectionTitleClass}>Debug Screenshots</h3>
            <p className="text-xs text-gh-text-muted mb-3">Screenshots are saved next to your config file each time the bot scans for slots.</p>
            <button
              type="button"
              className="px-3 py-2 bg-gh-bg border border-gh-border hover:border-gh-accent text-gh-text text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              onClick={() => window.electronAPI.openScreenshotsFolder()}
            >
              <svg className="w-4 h-4 text-gh-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Open Screenshots Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

SettingsView.displayName = 'SettingsView';

export default SettingsView;
