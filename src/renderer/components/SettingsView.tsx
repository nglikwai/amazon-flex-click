import React, { useImperativeHandle, forwardRef } from 'react';
import { useSettingsForm } from '../hooks/useSettingsForm';

interface Props {
  onSave: (minEarnings: number, maxEarnings: number) => void;
  onMousePosition?: (x: number, y: number) => void;
}

export interface SettingsViewRef {
  saveSettings: () => Promise<void>;
}

const inputClass = "w-full px-3 py-2 bg-gh-bg border border-gh-border rounded-md text-gh-text text-sm focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-gh-accent/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const inputReadOnly = `${inputClass} bg-gh-bg-tertiary`;
const labelClass = "block text-sm font-medium text-gh-text-secondary mb-1.5";
const sectionClass = "text-sm font-semibold text-gh-accent mb-3";

const PickAreaIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 8v8m-4-4h8" />
  </svg>
);

const PickCoordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const SettingsView = forwardRef<SettingsViewRef, Props>(({ onSave, onMousePosition }, ref) => {
  const { form, setField, mouseX, mouseY, showPermissionsNotice, save, pickCoordinate, pickArea } =
    useSettingsForm(onSave);

  // Keep parent mouse display in sync
  React.useEffect(() => {
    onMousePosition?.(mouseX, mouseY);
  }, [mouseX, mouseY]);

  useImperativeHandle(ref, () => ({ saveSettings: save }));

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

        <div className="space-y-6">

          {/* General Settings */}
          <section>
            <h3 className={sectionClass}>Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Minimum Earnings ($)</label>
                <input type="number" value={form.minEarnings} onChange={(e) => setField('minEarnings', e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Maximum Earnings ($) <span className="text-gh-text-muted font-normal">(0 = no limit)</span></label>
                <input type="number" value={form.maxEarnings} onChange={(e) => setField('maxEarnings', e.target.value)} className={inputClass} min="0" />
              </div>
              <div>
                <label className={labelClass}>Min Avg Earnings/hr ($) <span className="text-gh-text-muted font-normal">(0 = no limit)</span></label>
                <input type="number" value={form.minAvgEarningsPerHour} onChange={(e) => setField('minAvgEarningsPerHour', e.target.value)} className={inputClass} min="0" step="0.01" />
              </div>
              <div>
                <label className={labelClass}>Refresh Interval (ms)</label>
                <input type="number" value={form.intervalMs} onChange={(e) => setField('intervalMs', e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Detail Page Load (ms)</label>
                <input type="number" value={form.detailPageLoadMs} onChange={(e) => setField('detailPageLoadMs', e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Notification Email <span className="text-gh-text-muted font-normal">(blank = off)</span></label>
                <input type="email" value={form.notificationEmail} onChange={(e) => setField('notificationEmail', e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Button Positions */}
          <section>
            <h3 className={sectionClass}>Button Positions</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['refreshButton', 'scheduleButton'] as const).map((key) => {
                const label = key === 'refreshButton' ? 'Refresh Button' : 'Schedule Button';
                const xKey = `${key}X` as const;
                const yKey = `${key}Y` as const;
                return (
                  <React.Fragment key={key}>
                    <div>
                      <label className={labelClass}>{label} X</label>
                      <div className="flex gap-2">
                        <input type="number" value={form[xKey]} onChange={(e) => setField(xKey, e.target.value)} className={`${inputClass} flex-1`} required />
                        <button type="button" className="px-3 py-2 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-md transition-colors" onClick={() => pickCoordinate(key)} title="Pick position">
                          <PickCoordIcon />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{label} Y</label>
                      <input type="number" value={form[yKey]} onChange={(e) => setField(yKey, e.target.value)} className={inputReadOnly} required readOnly />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Areas */}
          {([
            { key: 'searchArea', label: 'Search Area', hint: '' },
            { key: 'timeArea',   label: 'Time Area',   hint: 'Region containing the working time (e.g. 17:15 - 21:15). Used to calculate average earnings per hour.' },
            { key: 'appWindow',  label: 'App Window',  hint: '' },
          ] as const).map(({ key, label, hint }) => (
            <section key={key}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gh-accent">{label}</h3>
                <button type="button" className="px-3 py-1.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2" onClick={() => pickArea(key)}>
                  <PickAreaIcon />
                  <span>Pick Area</span>
                </button>
              </div>
              {hint && <p className="text-xs text-gh-text-muted mb-3">{hint}</p>}
              <div className="grid grid-cols-2 gap-4">
                {(['X', 'Y', 'Width', 'Height'] as const).map((dim) => {
                  const fieldKey = `${key}${dim}` as keyof typeof form;
                  return (
                    <div key={dim}>
                      <label className={labelClass}>{dim === 'X' ? 'Top-Left X' : dim === 'Y' ? 'Top-Left Y' : dim}</label>
                      <input type="number" value={form[fieldKey]} onChange={(e) => setField(fieldKey, e.target.value)} className={inputReadOnly} readOnly />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Debug Screenshots */}
          <section>
            <h3 className={sectionClass}>Debug Screenshots</h3>
            <p className="text-xs text-gh-text-muted mb-3">Screenshots are saved next to your config file each time the bot scans for slots.</p>
            <button
              type="button"
              className="px-3 py-2 bg-gh-bg border border-gh-border hover:border-gh-accent text-gh-text text-sm font-medium rounded-md transition-colors flex items-center gap-2"
              onClick={() => window.electronAPI.openScreenshotsFolder()}
            >
              <svg className="w-4 h-4 text-gh-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Open Screenshots Folder
            </button>
          </section>

        </div>
      </div>
    </div>
  );
});

SettingsView.displayName = 'SettingsView';
export default SettingsView;
