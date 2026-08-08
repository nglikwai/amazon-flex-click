import React, { useImperativeHandle, forwardRef, useState } from 'react';
import DragSlider from './DragSlider';
import { useSettingsForm } from '../hooks/useSettingsForm';

interface Props {
  onSave: (minEarnings: number, maxEarnings: number) => void;
  onMousePosition?: (x: number, y: number) => void;
}

export interface SettingsViewRef {
  saveSettings: () => Promise<void>;
}

const input = "w-full px-3 py-2 bg-gh-bg border border-gh-border/60 rounded-lg text-gh-text text-sm placeholder-gh-text-muted focus:outline-none focus:border-gh-accent/60 focus:ring-1 focus:ring-gh-accent/20 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const inputRO = `${input} bg-gh-bg-tertiary/40 text-gh-text-secondary cursor-default`;
const label = "block text-xs font-medium text-gh-text-muted uppercase tracking-wider mb-1.5";
const pickBtn = "px-2.5 py-2 bg-gh-accent/10 hover:bg-gh-accent/20 border border-gh-accent/30 text-gh-accent rounded-lg transition-colors flex items-center justify-center";

const IconPlus = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);
const IconRect = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 8v8m-4-4h8" />
  </svg>
);
const IconFolder = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Divider = () => <div className="border-t border-gh-border/40" />;

interface AccordionProps {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}
const Accordion = ({ id, title, open, onToggle, children }: AccordionProps) => (
  <div>
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-5 py-4 bg-gh-bg-secondary/60 hover:bg-gh-bg-secondary/80 transition-colors text-left"
    >
      <span className="text-xs font-semibold text-gh-text uppercase tracking-widest">{title}</span>
      <IconChevron open={open} />
    </button>
    {open && <div className="bg-gh-bg-secondary/40 px-5 pb-5 pt-1 border-t border-gh-border/30">{children}</div>}
  </div>
);

const SettingsView = forwardRef<SettingsViewRef, Props>(({ onSave, onMousePosition }, ref) => {
  const { form, setField, mouseX, mouseY, showPermissionsNotice, save, pickCoordinate, pickArea } =
    useSettingsForm(onSave);

  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['earnings', 'timing']));

  const toggle = (id: string) =>
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  React.useEffect(() => { onMousePosition?.(mouseX, mouseY); }, [mouseX, mouseY]);
  useImperativeHandle(ref, () => ({ saveSettings: save }));

  return (
    <div className="w-full max-w-2xl mx-auto h-full overflow-y-auto py-4">

      {showPermissionsNotice && (
        <div className="mx-1 mb-4 p-4 rounded-xl bg-gh-warning/8 border border-gh-warning/30 flex items-start gap-3">
          <svg className="w-5 h-5 text-gh-warning shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gh-warning mb-2">Accessibility permissions required</p>
            <button type="button" onClick={() => window.electronAPI.openSystemPreferences()}
              className="text-xs px-3 py-1.5 bg-gh-warning/10 hover:bg-gh-warning/20 border border-gh-warning/30 text-gh-warning rounded-lg transition-colors">
              Open System Preferences
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gh-border/50 overflow-hidden divide-y divide-gh-border/40">

        {/* Earnings */}
        <Accordion id="earnings" title="Earnings" open={openSections.has('earnings')} onToggle={toggle}>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <label className={label}>Min ($)</label>
              <input type="number" value={form.minEarnings} onChange={(e) => setField('minEarnings', e.target.value)} className={input} placeholder="60" />
            </div>
            <div>
              <label className={label}>Max ($) <span className="normal-case font-normal text-gh-text-muted/60">0=off</span></label>
              <input type="number" value={form.maxEarnings} onChange={(e) => setField('maxEarnings', e.target.value)} className={input} placeholder="0" min="0" />
            </div>
            <div>
              <label className={label}>Min avg $/hr <span className="normal-case font-normal text-gh-text-muted/60">0=off</span></label>
              <input type="number" value={form.minAvgEarningsPerHour} onChange={(e) => setField('minAvgEarningsPerHour', e.target.value)} className={input} placeholder="0" min="0" step="1" />
            </div>
          </div>
        </Accordion>

        {/* Timing */}
        <Accordion id="timing" title="Timing" open={openSections.has('timing')} onToggle={toggle}>
          <div className="space-y-5 mt-4">
            <DragSlider label="Refresh interval" valueMs={parseInt(form.intervalMs) || 1500} minMs={1500} maxMs={10000} stepMs={100} onChange={(ms) => setField('intervalMs', String(ms))} />
            <DragSlider label="Detail page load" valueMs={parseInt(form.detailPageLoadMs) || 1000} minMs={500} maxMs={2000} stepMs={100} onChange={(ms) => setField('detailPageLoadMs', String(ms))} />
          </div>
        </Accordion>

        {/* Button Positions */}
        <Accordion id="buttons" title="Button Positions" open={openSections.has('buttons')} onToggle={toggle}>
          <div className="space-y-3 mt-4">
            {(['refreshButton', 'scheduleButton'] as const).map((key) => {
              const lbl = key === 'refreshButton' ? 'Refresh button' : 'Schedule button';
              const xKey = `${key}X` as const;
              const yKey = `${key}Y` as const;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={label}>{lbl}</label>
                    <button type="button" className={`${pickBtn} gap-1.5 px-3 text-xs font-medium`} onClick={() => pickCoordinate(key)}>
                      <IconPlus /><span>Pick</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={form[xKey]} placeholder="X" className={inputRO} readOnly />
                    <input type="number" value={form[yKey]} placeholder="Y" className={inputRO} readOnly />
                  </div>
                </div>
              );
            })}
          </div>
        </Accordion>

        {/* Login Button Positions */}
        <Accordion id="login-buttons" title="Login Button Positions" open={openSections.has('login-buttons')} onToggle={toggle}>
          <div className="space-y-3 mt-4">
            {([
              { key: 'menuButton',              label: 'Menu button' },
              { key: 'settingButton',           label: 'Setting button' },
              { key: 'logoutButton',            label: 'Sign out button' },
              { key: 'confirmSignOutButton',    label: 'Confirm sign out button' },
              { key: 'usernameButton',          label: 'Username field' },
              { key: 'passwordButton',          label: 'Password field' },
              { key: 'signButton',              label: 'Sign in button' },
              { key: 'offerButton',             label: 'Offer button' },
              { key: 'notificationCloseButton', label: 'Notification close button' },
            ] as const).map(({ key, label: lbl }) => {
              const xKey = `${key}X` as keyof typeof form;
              const yKey = `${key}Y` as keyof typeof form;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={label}>{lbl}</label>
                    <button type="button" className={`${pickBtn} gap-1.5 px-3 text-xs font-medium`} onClick={() => pickCoordinate(key)}>
                      <IconPlus /><span>Pick</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={form[xKey]} placeholder="X" className={inputRO} readOnly />
                    <input type="number" value={form[yKey]} placeholder="Y" className={inputRO} readOnly />
                  </div>
                </div>
              );
            })}
          </div>
        </Accordion>

        {/* Just For You */}
        <Accordion id="just-for-you" title="Just For You" open={openSections.has('just-for-you')} onToggle={toggle}>
          <div className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-gh-text-muted uppercase tracking-wider mb-0.5">Detection Area</p>
                  <p className="text-xs text-gh-text-muted/70">Region OCR'd to detect "Just for you" text</p>
                </div>
                <button type="button" className={`${pickBtn} gap-1.5 px-3 text-xs font-medium`} onClick={() => pickArea('justForYouArea')}>
                  <IconRect /><span>Pick</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['X', 'Y', 'Width', 'Height'] as const).map((dim) => {
                  const fieldKey = `justForYouArea${dim}` as keyof typeof form;
                  return (
                    <div key={dim}>
                      <label className={label}>{dim}</label>
                      <input type="number" value={form[fieldKey]} onChange={(e) => setField(fieldKey, e.target.value)} className={inputRO} readOnly />
                    </div>
                  );
                })}
              </div>
            </div>

            {([
              { key: 'justForYouSlot',           label: 'Slot coordinate',        hint: 'Click to open the slot' },
              { key: 'justForYouDecline',         label: 'Decline button',         hint: 'Click to decline the offer' },
              { key: 'justForYouConfirmDecline',  label: 'Confirm decline button', hint: 'Click to confirm the decline' },
            ] as const).map(({ key, label: lbl, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className={label}>{lbl}</label>
                    <p className="text-xs text-gh-text-muted/70 -mt-1">{hint}</p>
                  </div>
                  <button type="button" className={`${pickBtn} gap-1.5 px-3 text-xs font-medium`} onClick={() => pickCoordinate(key)}>
                    <IconPlus /><span>Pick</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={form[`${key}X` as keyof typeof form]} placeholder="X" className={inputRO} readOnly />
                  <input type="number" value={form[`${key}Y` as keyof typeof form]} placeholder="Y" className={inputRO} readOnly />
                </div>
              </div>
            ))}

            <div>
              <label className={label}>Check every N refreshes <span className="normal-case font-normal text-gh-text-muted/60">0=off</span></label>
              <input type="number" value={form.justForYouCheckInterval} onChange={(e) => setField('justForYouCheckInterval', e.target.value)} className={input} placeholder="10" min="0" />
            </div>
          </div>
        </Accordion>

        {/* Capture Areas */}
        <Accordion id="capture-areas" title="Capture Areas" open={openSections.has('capture-areas')} onToggle={toggle}>
          <div className="space-y-5 mt-4">
            {([
              { key: 'searchArea',       label: 'Search Area',         hint: 'Region where earnings amount appears' },
              { key: 'timeArea',         label: 'Time Area',           hint: 'Region showing working hours (e.g. 17:15 – 21:15)' },
              { key: 'appWindow',        label: 'Notification Window', hint: 'Region checked for booking confirmation popup' },
              { key: 'pageTitleArea',    label: 'Page Title Area',     hint: 'Region where the page title text appears' },
              { key: 'signInButtonArea', label: 'Sign In Button Area', hint: 'Region containing the sign in button' },
            ] as const).map(({ key, label: lbl, hint }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-medium text-gh-text-muted uppercase tracking-wider mb-0.5">{lbl}</p>
                    <p className="text-xs text-gh-text-muted/70">{hint}</p>
                  </div>
                  <button type="button" className={`${pickBtn} gap-1.5 px-3 text-xs font-medium`} onClick={() => pickArea(key)}>
                    <IconRect /><span>Pick</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['X', 'Y', 'Width', 'Height'] as const).map((dim) => {
                    const fieldKey = `${key}${dim}` as keyof typeof form;
                    return (
                      <div key={dim}>
                        <label className={label}>{dim}</label>
                        <input type="number" value={form[fieldKey]} onChange={(e) => setField(fieldKey, e.target.value)} className={inputRO} readOnly />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Notifications */}
        <Accordion id="notifications" title="Notifications" open={openSections.has('notifications')} onToggle={toggle}>
          <div className="mt-4">
            <label className={label}>Email on success <span className="normal-case font-normal text-gh-text-muted/60">leave blank to disable</span></label>
            <input type="email" value={form.notificationEmail} onChange={(e) => setField('notificationEmail', e.target.value)} placeholder="you@example.com" className={input} />
          </div>
        </Accordion>

        {/* Remote Control */}
        <Accordion id="remote" title="Remote Control" open={openSections.has('remote')} onToggle={toggle}>
          <div className="mt-4">
            <p className="text-xs text-gh-text-muted mb-3">HTTP server on localhost — send requests to start/stop the bot remotely.</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className={label}>Port</label>
                <input type="number" value={form.httpPort} onChange={(e) => setField('httpPort', e.target.value)} placeholder="3456" className={input} min="1024" max="65535" />
              </div>
              <div>
                <label className={label}>Username <span className="normal-case font-normal text-gh-text-muted/60">optional</span></label>
                <input type="text" value={form.httpUsername} onChange={(e) => setField('httpUsername', e.target.value)} placeholder="admin" className={input} autoComplete="off" />
              </div>
              <div>
                <label className={label}>Password</label>
                <input type="password" value={form.httpPassword} onChange={(e) => setField('httpPassword', e.target.value)} placeholder="••••••••" className={input} autoComplete="off" />
              </div>
            </div>
            <p className="text-xs font-mono text-gh-text-muted bg-gh-bg-tertiary/60 border border-gh-border/50 rounded-lg px-3 py-2 leading-relaxed">
              GET&nbsp; localhost:{form.httpPort || 3456}/<br />
              GET&nbsp; localhost:{form.httpPort || 3456}/status<br />
              POST localhost:{form.httpPort || 3456}/start<br />
              POST localhost:{form.httpPort || 3456}/stop
            </p>
          </div>
        </Accordion>

        {/* Debug */}
        <Accordion id="debug" title="Debug" open={openSections.has('debug')} onToggle={toggle}>
          <div className="mt-4">
            <button type="button" onClick={() => window.electronAPI.openScreenshotsFolder()}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gh-text-secondary hover:text-gh-text bg-gh-bg-tertiary/60 hover:bg-gh-bg-tertiary border border-gh-border/50 rounded-lg transition-colors">
              <IconFolder />
              Open screenshots folder
            </button>
          </div>
        </Accordion>

      </div>
    </div>
  );
});

SettingsView.displayName = 'SettingsView';
export default SettingsView;
