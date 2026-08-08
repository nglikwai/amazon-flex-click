import * as http from 'http';
import { BotController } from './BotController';

const SHARED_CSS = `
  :root{--bg:#08090c;--bg2:#0d0f14;--bg3:#13161d;--border:#1e2330;--text:#fff;--text2:#c8d6e8;--text3:#8fa3be;--accent:#4d9fff;--success:#2dde84;--danger:#ff4757;--warning:#ffaa00}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow:hidden}
  body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;display:flex;flex-direction:column}
  .topnav{flex-shrink:0;background:rgba(8,9,12,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;gap:10px}
  .nav-logo{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--text);text-decoration:none;flex:1}
  .nav-badge{font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg3);border:1px solid var(--border);color:var(--text3);font-family:monospace}
  .nav-links{display:flex;gap:6px}
  .nav-links a{font-size:13px;color:var(--text3);text-decoration:none;padding:6px 13px;border-radius:8px;border:1px solid var(--border);white-space:nowrap;transition:color .15s,border-color .15s,background .15s}
  .nav-links a:hover{color:var(--text);border-color:var(--accent)}
  .nav-links a.active{color:var(--accent);border-color:var(--accent);background:rgba(77,159,255,.1);font-weight:600}
  .wrap{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;max-width:520px;width:100%;margin:0 auto;padding:20px 16px}
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px}
  .card-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);margin-bottom:12px}
  label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:5px}
  input,select{width:100%;padding:11px 12px;background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);font-size:14px;outline:none;transition:border-color .2s;-webkit-appearance:none}
  input:focus{border-color:var(--accent)}
  .field{margin-bottom:12px}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  button,a.btn{display:block;width:100%;padding:14px;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;transition:opacity .15s,transform .1s}
  button:active,a.btn:active{transform:scale(.98)}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-success{background:var(--success);color:#08090c}
  .btn-danger{background:var(--danger);color:#fff}
  button:disabled{opacity:.35;cursor:not-allowed}
  .alert{font-size:13px;padding:11px 14px;border-radius:10px;margin-bottom:14px}
  .alert-success{background:rgba(45,222,132,.08);border:1px solid rgba(45,222,132,.25);color:var(--success)}
  .alert-error{background:rgba(255,71,87,.08);border:1px solid rgba(255,71,87,.3);color:var(--danger)}
  .alert-info{background:rgba(77,159,255,.08);border:1px solid rgba(77,159,255,.25);color:var(--accent)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

const navHTML = (active: 'dashboard' | 'account' | 'config') => `
<div class="topnav">
  <div class="nav-logo">
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none">
      <rect width="512" height="512" rx="112" fill="url(#n-bg)"/>
      <path d="M216 110L176 260H252L200 402" stroke="url(#n-bolt)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="366" cy="150" r="72" fill="url(#n-badge)"/>
      <text x="366" y="178" text-anchor="middle" fill="#0a0d14" font-size="80" font-weight="900" font-family="-apple-system,Arial,sans-serif">$</text>
      <defs>
        <linearGradient id="n-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0c1018"/><stop offset="100%" stop-color="#080c12"/></linearGradient>
        <linearGradient id="n-bolt" x1="216" y1="110" x2="200" y2="402" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#4d9fff"/><stop offset="100%" stop-color="#2dde84"/></linearGradient>
        <linearGradient id="n-badge" x1="294" y1="78" x2="438" y2="222" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#2dde84"/><stop offset="100%" stop-color="#1aad62"/></linearGradient>
      </defs>
    </svg>
    Slotter <span class="nav-badge">v3</span>
  </div>
  <nav class="nav-links">
    <a href="/" class="${active === 'dashboard' ? 'active' : ''}">Home</a>
    <a href="/config" class="${active === 'config' ? 'active' : ''}">Config</a>
    <a href="/account" class="${active === 'account' ? 'active' : ''}">Account</a>
  </nav>
</div>`;

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Slotter — Dashboard</title>
<style>
  ${SHARED_CSS}
  .status-hero{text-align:center;padding:28px 16px 20px}
  .status-icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;transition:background .3s}
  .status-icon.running{background:rgba(45,222,132,.12);box-shadow:0 0 32px rgba(45,222,132,.15)}
  .status-icon.initializing{background:rgba(77,159,255,.12);box-shadow:0 0 32px rgba(77,159,255,.15)}
  .status-icon.success{background:rgba(45,222,132,.12);box-shadow:0 0 32px rgba(45,222,132,.2)}
  .status-icon.error{background:rgba(255,71,87,.12)}
  .status-icon.stopped{background:var(--bg3)}
  .dot-ring{width:28px;height:28px;border-radius:50%;border:3px solid currentColor;display:flex;align-items:center;justify-content:center}
  .dot-ring.running{color:var(--success);animation:spin 2s linear infinite}
  .dot-ring.initializing{color:var(--accent);animation:spin 1.2s linear infinite}
  .dot-ring.success{color:var(--success)}
  .dot-ring.error{color:var(--danger)}
  .dot-ring.stopped{color:var(--text3)}
  .dot-center{width:10px;height:10px;border-radius:50%;background:currentColor}
  .status-label{font-size:22px;font-weight:700;margin-bottom:4px}
  .status-sub{font-size:14px;color:var(--text3)}
  .earnings-badge{display:inline-block;margin-top:10px;font-size:20px;font-weight:800;font-family:monospace;color:var(--success);background:rgba(45,222,132,.08);border:1px solid rgba(45,222,132,.2);padding:5px 16px;border-radius:99px}
  .btn-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .log-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .log-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)}
  .log-count{font-size:11px;color:var(--text3);font-family:monospace}
  .log{font-family:'SF Mono','Fira Code',monospace;font-size:12px;max-height:360px;overflow-y:auto;border:1px solid var(--border);border-radius:10px}
  .log-row{display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:1px solid rgba(30,35,48,.5)}
  .log-row:last-child{border-bottom:none}
  .row-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
  .c-success{color:var(--success)}.c-warning{color:var(--warning)}.c-muted{color:var(--text3)}.c-danger{color:var(--danger)}.c-login{color:var(--accent)}
  .bg-success{background:var(--success)}.bg-warning{background:var(--warning)}.bg-muted{background:var(--text3)}.bg-danger{background:var(--danger)}.bg-login{background:var(--accent)}
  .log-msg{flex:1;line-height:1.4}
  .log-time{color:var(--text3);font-size:10px;white-space:nowrap}
  .repeat-badge{margin-left:6px;font-size:10px;font-weight:700;padding:1px 6px;border-radius:99px;background:var(--bg3);border:1px solid var(--border);color:var(--text3);vertical-align:middle}
  .empty{padding:24px;text-align:center;color:var(--text3);font-size:13px}
  .chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px}
  .chip{font-size:11px;font-weight:600;font-family:monospace;padding:4px 10px;border-radius:99px;background:var(--bg3);border:1px solid var(--border);color:var(--text3)}
  .chip span{color:var(--text);margin-left:3px}
</style>
</head>
<body>
${navHTML('dashboard')}
<div class="wrap">

  <div class="status-hero">
    <div class="status-icon stopped" id="status-icon">
      <div class="dot-ring stopped" id="dot-ring">
        <div class="dot-center"></div>
      </div>
    </div>
    <div class="status-label" id="status-label">Connecting...</div>
    <div class="status-sub" id="status-sub">—</div>
    <div id="earnings-wrap"></div>
    <div class="chips" id="cfg-chips"></div>
  </div>

  <div class="card">
    <div class="btn-row">
      <button class="btn-success" id="btn-start" onclick="sendCmd('start')" disabled>▶ Start</button>
      <button class="btn-danger"  id="btn-stop"  onclick="sendCmd('stop')"  disabled>■ Stop</button>
    </div>
  </div>

  <div class="card">
    <div class="log-header">
      <span class="log-title">Activity</span>
      <span class="log-count" id="log-count"></span>
    </div>
    <div class="log" id="log"><div class="empty">No activity yet</div></div>
  </div>

</div>
<script>
  function typeColor(type) {
    if (type === 'success') return 'success';
    if (type === 'detected' || type === 'grabbing') return 'warning';
    if (type === 'error') return 'danger';
    if (type === 'login') return 'login';
    return 'muted';
  }

  let lastCount = 0;

  async function refresh() {
    try {
      const data = await fetch('/status').then(r => r.json());
      const running = data.running;
      const initializing = data.loginRunning;
      const state = initializing ? 'initializing' : running ? 'running' : data.earnings > 0 ? 'success' : 'stopped';
      const labels = { running:'Running', initializing:'Initializing…', success:'Success', stopped:'Stopped' };
      const subs   = { running:'Press Stop to cancel', initializing:'Login automation running', success:'Slot grabbed!', stopped:'Ready to start' };

      document.getElementById('status-icon').className  = 'status-icon ' + state;
      document.getElementById('dot-ring').className     = 'dot-ring ' + state;
      document.getElementById('status-label').textContent = labels[state] || 'Stopped';
      document.getElementById('status-sub').textContent   = subs[state] || '';
      document.getElementById('earnings-wrap').innerHTML  = data.earnings > 0
        ? '<div class="earnings-badge">$' + data.earnings.toFixed(2) + '</div>' : '';

      const chips = [];
      if (data.minEarnings > 0) chips.push('Min <span>$' + data.minEarnings + '</span>');
      if (data.maxEarnings > 0) chips.push('Max <span>$' + data.maxEarnings + '</span>');
      if (data.minAvgEarningsPerHour > 0) chips.push('Avg <span>$' + data.minAvgEarningsPerHour + '/hr</span>');
      document.getElementById('cfg-chips').innerHTML = chips.map(c => '<div class="chip">' + c + '</div>').join('');

      document.getElementById('btn-start').disabled = running || initializing;
      document.getElementById('btn-stop').disabled  = !running || initializing;

      const activity = data.activity ?? [];
      document.getElementById('log-count').textContent = activity.length ? activity.length + ' entries' : '';

      if (activity.length !== lastCount) {
        lastCount = activity.length;
        const log = document.getElementById('log');
        if (!activity.length) { log.innerHTML = '<div class="empty">No activity yet</div>'; return; }
        // Collapse consecutive identical messages
        const grouped = [];
        for (const e of [...activity].reverse()) {
          const prev = grouped[grouped.length - 1];
          if (prev && prev.message === e.message && prev.type === e.type) {
            prev.count++;
            prev.timestamp = e.timestamp;
          } else {
            grouped.push({ ...e, count: 1 });
          }
        }
        log.innerHTML = grouped.map(e => {
          const c = typeColor(e.type);
          const t = new Date(e.timestamp).toLocaleTimeString();
          const badge = e.count > 1 ? '<span class="repeat-badge">×' + e.count + '</span>' : '';
          return '<div class="log-row"><span class="row-dot bg-' + c + '"></span>'
            + '<span class="log-msg c-' + c + '">' + e.message + badge + '</span>'
            + '<span class="log-time">' + t + '</span></div>';
        }).join('');
      }
    } catch(e) {
      document.getElementById('status-label').textContent = 'Offline';
      document.getElementById('status-sub').textContent = 'Cannot reach server';
    }
  }

  async function sendCmd(cmd) {
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled  = true;
    await fetch('/' + cmd, { method: 'POST' });
    refresh();
  }

  refresh();
  setInterval(refresh, 2000);
</script>
</body>
</html>`;


const ACCOUNT_HTML = (email = '', saved = false, error = false) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Slotter — Account</title>
<style>
  ${SHARED_CSS}
  .init-bar{display:none;background:rgba(77,159,255,.06);border:1px solid rgba(77,159,255,.25);border-radius:12px;padding:14px 16px;margin-bottom:12px}
  .init-bar.visible{display:block}
  .init-label{font-size:13px;font-weight:600;color:var(--accent);margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .init-label::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent);animation:pulse 1s ease-in-out infinite;flex-shrink:0}
  .bar-track{background:var(--border);border-radius:99px;height:4px;overflow:hidden}
  .bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--success));border-radius:99px;animation:slide 1.4s ease-in-out infinite}
  @keyframes slide{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
  fieldset{border:none;padding:0;margin:0}
  .hint{font-size:12px;color:var(--text3);margin-top:12px;line-height:1.6}
</style>
</head>
<body>
${navHTML('account')}
<div class="wrap">

  <div class="init-bar" id="init-bar">
    <div class="init-label">Initializing login…</div>
    <div class="bar-track"><div class="bar-fill"></div></div>
  </div>

  ${saved ? '<div class="alert alert-success">Credentials saved — login automation running.</div>' : ''}
  ${error ? '<div class="alert alert-error">Failed to save credentials.</div>'                    : ''}

  <div class="card">
    <div class="card-title">Amazon Flex Account</div>
    <form method="POST" action="/account" id="form">
      <fieldset id="fields" style="border:none;padding:0;margin:0">
        <div class="field">
          <label>Email / Phone</label>
          <input type="text" name="email" value="${email.replace(/"/g, '&quot;')}" placeholder="you@example.com" autocomplete="off" required/>
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" autocomplete="off"/>
        </div>
        <button type="submit" id="save-btn" class="btn-primary">Save &amp; login</button>
      </fieldset>
    </form>
    <p class="hint">Credentials are stored locally and never sent externally.</p>
  </div>

</div>
<script>
  const bar    = document.getElementById('init-bar');
  const fields = document.getElementById('fields');
  const btn    = document.getElementById('save-btn');
  let wasRunning = false;

  async function poll() {
    try {
      const data = await fetch('/status').then(r => r.json());
      const running = data.loginRunning;
      bar.className   = running ? 'init-bar visible' : 'init-bar';
      fields.disabled = running;
      btn.disabled    = running;
      btn.textContent = running ? 'Initializing…' : 'Save & login';
      if (wasRunning && !running) window.location.reload();
      wasRunning = running;
    } catch(e) {}
  }

  poll();
  setInterval(poll, 1500);
</script>
</body>
</html>`;

const CONFIG_HTML = (cfg: Record<string, any>, saved = false) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Slotter — Config</title>
<style>
  ${SHARED_CSS}
  .sl-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
  .sl-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3)}
  .sl-val{font-size:15px;font-weight:800;font-family:monospace;color:var(--text)}
  .sl-val.off{color:var(--text3);font-size:12px;font-weight:600}
  input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:99px;outline:none;border:none;padding:0;cursor:pointer;margin-bottom:18px;background:var(--border)}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:var(--accent);cursor:pointer;border:3px solid var(--bg2);box-shadow:0 0 0 1px var(--accent)}
  input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--accent);cursor:pointer;border:3px solid var(--bg2)}
</style>
</head>
<body>
${navHTML('config')}
<div class="wrap">
  ${saved ? '<div class="alert alert-success">Config saved.</div>' : ''}
  <form method="POST" action="/config" id="cfg-form">
    <div class="card">
      <div class="card-title">Earnings</div>

      <div class="sl-row"><span class="sl-label">Min ($)</span><span class="sl-val" id="lbl-minEarnings"></span></div>
      <input type="range" name="minEarnings" id="minEarnings" min="20" max="150" step="1" value="${cfg.minEarnings ?? 20}" oninput="upd(this,'$',false)"/>

      <div class="sl-row"><span class="sl-label">Max ($)</span><span class="sl-val" id="lbl-maxEarnings"></span></div>
      <input type="range" name="maxEarnings" id="maxEarnings" min="0" max="150" step="1" value="${cfg.maxEarnings ?? 0}" oninput="upd(this,'$',true)"/>

      <div class="sl-row"><span class="sl-label">Min avg $/hr</span><span class="sl-val" id="lbl-minAvgEarningsPerHour"></span></div>
      <input type="range" name="minAvgEarningsPerHour" id="minAvgEarningsPerHour" min="0" max="30" step="1" value="${cfg.minAvgEarningsPerHour ?? 0}" oninput="upd(this,'$',true,'/hr')"/>
    </div>

    <div class="card">
      <div class="card-title">Timing</div>

      <div class="sl-row"><span class="sl-label">Refresh interval</span><span class="sl-val" id="lbl-intervalMs"></span></div>
      <input type="range" name="intervalMs" id="intervalMs" min="1500" max="10000" step="100" value="${cfg.intervalMs ?? 1500}" oninput="updMs(this)"/>

      <div class="sl-row"><span class="sl-label">Detail page load</span><span class="sl-val" id="lbl-detailPageLoadMs"></span></div>
      <input type="range" name="detailPageLoadMs" id="detailPageLoadMs" min="500" max="2000" step="100" value="${cfg.detailPageLoadMs ?? 1000}" oninput="updMs(this)"/>
    </div>

    <button type="submit" class="btn-primary">Save config</button>
  </form>
</div>
<script>
  function track(el) {
    const pct = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.background = 'linear-gradient(to right,#4d9fff 0%,#4d9fff '+pct+'%,#1e2330 '+pct+'%,#1e2330 100%)';
  }
  function upd(el, prefix, zeroOff, suffix) {
    const v = parseFloat(el.value);
    const lbl = document.getElementById('lbl-' + el.id);
    if (zeroOff && v === 0) { lbl.textContent = 'Off'; lbl.className = 'sl-val off'; }
    else { lbl.textContent = prefix + v + (suffix || ''); lbl.className = 'sl-val'; }
    track(el);
  }
  function updMs(el) {
    const v = parseInt(el.value);
    const lbl = document.getElementById('lbl-' + el.id);
    lbl.textContent = v >= 1000 ? (v/1000).toFixed(1)+'s' : v+'ms';
    lbl.className = 'sl-val';
    track(el);
  }
  document.querySelectorAll('input[type=range]').forEach(el => el.dispatchEvent(new Event('input')));
</script>
</body>
</html>`;

function parseBody(req: http.IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      resolve(Object.fromEntries(new URLSearchParams(body)));
    });
  });
}

export class HttpServer {
  private server: http.Server;

  constructor(controller: BotController, port: number, private getAmazonCredentials: () => { email: string; password: string }, private saveAmazonCredentials: (email: string, password: string) => void, private runLogin: (shouldAbort: () => boolean) => Promise<void>, private getConfig: () => Record<string, any>, private saveConfig: (patch: Record<string, any>) => void) {
    this.server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');

      const url = req.url ?? '/';
      const method = req.method ?? 'GET';

      try {
        if (method === 'GET' && (url === '/' || url === '/dashboard')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.writeHead(200);
          res.end(DASHBOARD_HTML);

        } else if (url === '/account') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          if (method === 'GET') {
            const creds = this.getAmazonCredentials();
            res.writeHead(200);
            res.end(ACCOUNT_HTML(creds.email));
          } else if (method === 'POST') {
            try {
              const body = await parseBody(req);
              this.saveAmazonCredentials(body.email ?? '', body.password ?? '');
              controller.startLogin(this.runLogin)
                .catch((err: any) => console.error('[login-flow]', err.message));
              res.writeHead(302, { Location: '/' });
              res.end();
            } catch {
              res.writeHead(500);
              res.end(ACCOUNT_HTML('', false, true));
            }
          }

        } else if (url === '/config') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          if (method === 'GET') {
            res.writeHead(200);
            res.end(CONFIG_HTML(this.getConfig()));
          } else if (method === 'POST') {
            const body = await parseBody(req);
            const patch: Record<string, any> = {
              minEarnings:           parseFloat(body.minEarnings) || 0,
              maxEarnings:           parseFloat(body.maxEarnings) || 0,
              minAvgEarningsPerHour: parseFloat(body.minAvgEarningsPerHour) || 0,
              intervalMs:            parseInt(body.intervalMs) || 1500,
              detailPageLoadMs:      parseInt(body.detailPageLoadMs) || 1000,
            };
            this.saveConfig(patch);
            res.writeHead(200);
            res.end(CONFIG_HTML(this.getConfig(), true));
          }

        } else if (method === 'GET' && url === '/status') {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          const cfg = this.getConfig();
          res.end(JSON.stringify({
            running:               controller.isRunning(),
            earnings:              controller.getEarnings(),
            activity:              controller.getActivity(),
            loginRunning:          controller.isLoginRunning(),
            minEarnings:           cfg.minEarnings ?? 0,
            maxEarnings:           cfg.maxEarnings ?? 0,
            minAvgEarningsPerHour: cfg.minAvgEarningsPerHour ?? 0,
          }));

        } else if (method === 'POST' && url === '/start') {
          res.setHeader('Content-Type', 'application/json');
          const result = await controller.start();
          res.writeHead(result.success ? 200 : 400);
          res.end(JSON.stringify(result));

        } else if (method === 'POST' && url === '/stop') {
          res.setHeader('Content-Type', 'application/json');
          const result = await controller.stop();
          res.writeHead(result.success ? 200 : 400);
          res.end(JSON.stringify(result));

        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not found. Available: GET /, GET /status, POST /start, POST /stop' }));
        }
      } catch (err: any) {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    this.server.listen(port, '0.0.0.0', () => {
      console.log(`[http] Listening on http://0.0.0.0:${port}`);
    });

    this.server.on('error', (err) => {
      console.error('[http] Server error:', err.message);
    });
  }

  stop(): void {
    this.server.close();
  }
}
