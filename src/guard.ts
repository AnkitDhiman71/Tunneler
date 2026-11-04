import http from 'node:http';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import { AdminTelemetry, type FeedbackItem } from './admin.js';
import { FEEDBACK_WIDGET_SCRIPT } from './widget.js';
import pc from 'picocolors';

export interface PinGuardOptions {
  targetPort: number;
  targetHost?: string;
  pin?: string;
  adminPassword?: string;
  enableFeedback?: boolean;
}

export class PinGuardProxy {
  private targetPort: number;
  private targetHost: string;
  public pin?: string;
  private authToken: string;
  private adminAuthToken: string;
  public enableFeedback: boolean;
  public telemetry: AdminTelemetry;
  public server: http.Server;
  public port = 0;

  constructor(options: PinGuardOptions) {
    this.targetPort = options.targetPort;
    this.targetHost = options.targetHost || 'localhost';
    this.pin = options.pin ? String(options.pin).trim() : undefined;
    this.enableFeedback = options.enableFeedback !== false;
    this.telemetry = new AdminTelemetry(options.adminPassword);
    this.telemetry.targetHost = this.targetHost;
    this.telemetry.targetPort = this.targetPort;
    this.authToken = crypto.randomBytes(24).toString('hex');
    this.adminAuthToken = crypto.randomBytes(24).toString('hex');

    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    this.setupWebSocketUpgrade();
  }

  private isVisitorAuthorized(req: http.IncomingMessage): boolean {
    if (!this.pin) return true;
    const cookies = req.headers.cookie || '';
    return cookies.includes(`peer_port_auth=${this.authToken}`);
  }

  private isAdminAuthorized(req: http.IncomingMessage): boolean {
    const cookies = req.headers.cookie || '';
    return cookies.includes(`peer_admin_auth=${this.adminAuthToken}`);
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!this.telemetry.publicUrl) {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const proto = req.headers['x-forwarded-proto'] || 'http';
      if (host) {
        this.telemetry.publicUrl = `${proto}://${host}`;
      }
    }

    // 0. Auto-redirect on Render or hub domain to Admin Portal for any non-internal route
    const isRenderHub = Boolean(process.env.RENDER || req.headers.host?.includes('onrender.com'));
    if (isRenderHub && !url.pathname.startsWith('/__peer_')) {
      res.writeHead(302, { Location: '/__peer_admin' });
      res.end();
      return;
    }

    // Hub Registration (CLI connects to central admin hub)
    if (url.pathname === '/__peer_hub_register' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const tunnel = this.telemetry.registerRemoteTunnel(data, clientIp);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, isPaused: tunnel.isPaused, disabledPages: tunnel.disabledPages }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Hub Heartbeat & Live Telemetry Sync
    if (url.pathname === '/__peer_hub_heartbeat' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          let tunnel = this.telemetry.updateRemoteTunnel(data);
          if (!tunnel) {
            tunnel = this.telemetry.registerRemoteTunnel(data, clientIp);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, isPaused: tunnel.isPaused, disabledPages: tunnel.disabledPages }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // Hub Disconnect Notification
    if (url.pathname === '/__peer_hub_disconnect' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data && data.id) {
            this.telemetry.remoteTunnels.delete(data.id);
          }
        } catch {}
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    // 1. Admin Login POST
    if (url.pathname === '/__peer_admin_login' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const enteredPassword = (params.get('password') || '').trim();

        if (enteredPassword && enteredPassword === this.telemetry.adminPassword.trim()) {
          res.writeHead(302, {
            'Set-Cookie': `peer_admin_auth=${this.adminAuthToken}; Path=/; HttpOnly; SameSite=Lax`,
            Location: '/__peer_admin',
          });
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(this.telemetry.renderAdminLoginHtml('Incorrect Admin Password'));
        }
      });
      return;
    }

    // 2. Admin Dashboard View (Password Protected)
    if (url.pathname === '/__peer_admin') {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(this.telemetry.renderAdminLoginHtml());
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.telemetry.renderAdminDashboardHtml());
      return;
    }

    // 3. Admin Live Data JSON Route (Requires Admin Auth)
    if (url.pathname === '/__peer_admin_data') {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.telemetry.getStats()));
      return;
    }

    // 4. Admin Action POST Route (Requires Admin Auth)
    if (url.pathname === '/__peer_admin_action' && req.method === 'POST') {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          this.handleAdminAction(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, stats: this.telemetry.getStats() }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 4.5. Admin API Laboratory Test Route (Requires Admin Auth)
    if (url.pathname === '/__peer_admin_api_test' && req.method === 'POST') {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const { method = 'GET', path = '/', headers = {}, body: reqBody = '' } = JSON.parse(body);
          const startTime = Date.now();
          const targetUrl = new URL(path, `http://${this.targetHost}:${this.targetPort}`);

          const proxyReq = http.request(
            targetUrl,
            {
              method: method.toUpperCase(),
              headers: {
                ...headers,
                host: `${this.targetHost}:${this.targetPort}`,
              },
            },
            (targetRes) => {
              let resData = '';
              targetRes.on('data', (c) => (resData += c));
              targetRes.on('end', () => {
                const duration = Date.now() - startTime;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    status: targetRes.statusCode || 200,
                    headers: targetRes.headers,
                    body: resData,
                    duration,
                  })
                );
              });
            }
          );

          proxyReq.on('error', (err) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                status: 502,
                headers: {},
                body: `Connection failed: ${err.message}`,
                duration: Date.now() - startTime,
              })
            );
          });

          if (reqBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            proxyReq.write(typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody));
          }
          proxyReq.end();
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 4.8. IP Firewall Blacklist Check
    if (this.telemetry.isIpBlocked(clientIp)) {
      res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><title>403 Access Denied</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem;text-align:center;}h1{color:#f85149;}</style></head><body><h1>🚫 403 Access Denied</h1><p>Your IP address (<code>${escapeHtml(clientIp)}</code>) has been blocked by the administrator.</p></body></html>`);
      return;
    }

    // 5. Emergency Master Kill Switch Check
    if (this.telemetry.isPaused) {
      res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.renderPausedScreen());
      return;
    }

    // 6. Route / Page-Level Disabling Check (Admin banned this specific page only)
    if (this.telemetry.isPageDisabled(url.pathname)) {
      res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><title>403 Page Disabled</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem;text-align:center;}h1{color:#f85149;}</style></head><body><h1>🚫 403 Page Disabled</h1><p>The page <code>${escapeHtml(url.pathname)}</code> has been disabled by the administrator.</p><a href="/" style="color:#58a6ff;">← Return to Home</a></body></html>`);
      return;
    }

    // 7. Visual Feedback POST
    if (url.pathname === '/__peer_feedback' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const feedback = this.telemetry.addFeedback({
            comment: data.comment || '',
            selector: data.selector || 'body',
            elementText: data.elementText || '',
            url: data.url || '/',
            screenSize: data.screenSize || 'unknown',
            userAgent: data.userAgent || '',
            timestamp: Date.now(),
          });

          this.logFeedbackToTerminal(feedback);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, id: feedback.id }));
        } catch (err: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 8. Public Link PIN Verification (If PIN was configured)
    if (url.pathname === '/__peer_auth' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));

      req.on('end', () => {
        const params = new URLSearchParams(body);
        const enteredPin = (params.get('pin') || '').trim();
        const returnUrl = params.get('returnUrl') || '/';

        if (this.pin && enteredPin === this.pin) {
          res.writeHead(302, {
            'Set-Cookie': `peer_port_auth=${this.authToken}; Path=/; HttpOnly; SameSite=Lax`,
            Location: returnUrl,
          });
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(this.renderLockscreen(returnUrl, 'Incorrect PIN. Please try again.'));
        }
      });
      return;
    }

    // 9. Check Visitor Auth (if PIN enabled)
    if (!this.isVisitorAuthorized(req)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.renderLockscreen(url.pathname + url.search));
      return;
    }

    // 10. Forward to Target App
    this.forwardToTarget(req, res, clientIp);
  }

  private handleAdminAction(payload: any): void {
    const { action, tunnelId } = payload;
    if (tunnelId && tunnelId !== 'local_tunnel') {
      const remote = this.telemetry.remoteTunnels.get(tunnelId);
      if (remote) {
        if (action === 'toggle_pause') {
          remote.isPaused = !remote.isPaused;
        } else if (action === 'toggle_disable_page' && payload.route) {
          const route = payload.route.trim().toLowerCase();
          const idx = remote.disabledPages.indexOf(route);
          if (idx >= 0) remote.disabledPages.splice(idx, 1);
          else remote.disabledPages.push(route);
        }
        return;
      }
    }

    switch (action) {
      case 'toggle_pause':
        this.telemetry.isPaused = !this.telemetry.isPaused;
        console.log(
          this.telemetry.isPaused
            ? pc.bold(pc.red('\n  🛑 [KILL SWITCH ACTIVATED] Public tunnel access is now PAUSED!'))
            : pc.bold(pc.green('\n  ▶ [KILL SWITCH DEACTIVATED] Public tunnel access has RESUMED!'))
        );
        break;
      case 'toggle_disable_page':
        if (payload.route) {
          const isBanned = this.telemetry.toggleDisablePage(payload.route);
          console.log(
            isBanned
              ? pc.red(`  🚫 [PAGE DISABLED] Blocked route: ${payload.route}`)
              : pc.green(`  ✔ [PAGE RE-ENABLED] Restored route: ${payload.route}`)
          );
        }
        break;
      case 'toggle_resolve_feedback':
        const fb = this.telemetry.feedbacks.find((f) => f.id === payload.id);
        if (fb) fb.resolved = !fb.resolved;
        break;
      case 'toggle_block_ip':
        if (payload.ip) {
          const isBlocked = this.telemetry.toggleBlockVisitorIp(payload.ip);
          console.log(
            isBlocked
              ? pc.red(`  🚫 [FIREWALL] Blocked IP: ${payload.ip}`)
              : pc.green(`  ✔ [FIREWALL] Restored IP: ${payload.ip}`)
          );
        }
        break;
    }
  }

  private forwardToTarget(req: http.IncomingMessage, res: http.ServerResponse, clientIp: string): void {
    const startTime = Date.now();
    this.telemetry.recordRequestStart();

    const headers = { ...req.headers };
    headers['host'] = `${this.targetHost}:${this.targetPort}`;
    delete headers['accept-encoding'];

    const options: http.RequestOptions = {
      hostname: this.targetHost,
      port: this.targetPort,
      path: req.url,
      method: req.method,
      headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      const contentType = proxyRes.headers['content-type'] || '';
      const isHtml = typeof contentType === 'string' && contentType.includes('text/html');

      if (this.enableFeedback && isHtml) {
        const chunks: Buffer[] = [];
        proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
        proxyRes.on('end', () => {
          let html = Buffer.concat(chunks).toString('utf-8');

          if (html.includes('</body>')) {
            html = html.replace('</body>', `${FEEDBACK_WIDGET_SCRIPT}</body>`);
          } else if (html.includes('</html>')) {
            html = html.replace('</html>', `${FEEDBACK_WIDGET_SCRIPT}</html>`);
          } else {
            html += FEEDBACK_WIDGET_SCRIPT;
          }

          const modifiedBuffer = Buffer.from(html, 'utf-8');
          const resHeaders = { ...proxyRes.headers };
          delete resHeaders['transfer-encoding'];
          resHeaders['content-length'] = String(modifiedBuffer.length);

          res.writeHead(proxyRes.statusCode || 200, resHeaders);
          res.end(modifiedBuffer);

          this.finishRequest(req.method || 'GET', req.url || '/', proxyRes.statusCode || 200, startTime, clientIp, req.headers);
        });
      } else {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);

        proxyRes.on('end', () => {
          this.finishRequest(req.method || 'GET', req.url || '/', proxyRes.statusCode || 200, startTime, clientIp, req.headers);
        });
      }
    });

    proxyReq.on('error', () => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><title>peer-port Tunnel</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem 1.5rem;text-align:center;}.card{max-width:480px;margin:0 auto;background:#161b22;padding:2rem;border-radius:12px;border:1px solid rgba(240,246,252,0.1);}</style></head><body><div class="card"><h1>⚡ peer-port Tunnel</h1><p style="color:#8b949e;margin-top:8px;">Tunnel is online and waiting for local app traffic.</p></div></body></html>`);
      this.finishRequest(req.method || 'GET', req.url || '/', 200, startTime, clientIp, req.headers);
    });

    req.pipe(proxyReq);
  }

  private finishRequest(
    method: string,
    url: string,
    status: number,
    startTime: number,
    ip: string,
    headers: Record<string, any>
  ): void {
    const duration = Date.now() - startTime;
    this.telemetry.recordRequestEnd(method, url, status, duration, ip, headers);
  }

  private logFeedbackToTerminal(f: FeedbackItem): void {
    console.log('\n' + pc.bold(pc.bgMagenta(pc.white(' 📌 NEW VISUAL FEEDBACK '))) + ' on ' + pc.cyan(f.url));
    console.log(`  💬 ${pc.bold(pc.green(`"${f.comment}"`))}`);
    console.log(`  🎯 Element: ${pc.yellow(f.selector)} ${f.elementText ? pc.dim(`("${f.elementText}")`) : ''}`);
    console.log(`  📱 Device:  ${pc.white(f.screenSize)}  •  ${pc.dim(new Date(f.timestamp).toLocaleTimeString())}\n`);
  }

  private setupWebSocketUpgrade(): void {
    this.server.on('upgrade', (req, socket, head) => {
      if (!this.isVisitorAuthorized(req) || this.telemetry.isPaused) {
        socket.destroy();
        return;
      }

      const proxyReq = http.request({
        hostname: this.targetHost,
        port: this.targetPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `${this.targetHost}:${this.targetPort}`,
        },
      });

      proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        socket.write(
          `HTTP/1.1 101 Switching Protocols\r\n` +
            Object.entries(proxyRes.headers)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\r\n') +
            '\r\n\r\n'
        );
        if (proxyHead && proxyHead.length) socket.write(proxyHead);
        if (head && head.length) proxySocket.write(head);
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });

      proxyReq.on('error', () => {
        socket.destroy();
      });

      proxyReq.end();
    });
  }

  private renderPausedScreen(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⏸️ Tunnel Paused — peer-port</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: radial-gradient(circle at 50% 0%, #161b22, #0d1117 80%); color: #e6edf3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; text-align: center; }
    .card { background: rgba(22, 27, 34, 0.9); border: 1px solid rgba(240, 246, 252, 0.15); border-radius: 16px; padding: 2.5rem; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    h1 { font-size: 1.4rem; margin: 1rem 0 0.5rem; }
    p { color: #8b949e; font-size: 0.9rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 3rem;">⏸️</div>
    <h1>Tunnel Temporarily Paused</h1>
    <p>The host administrator has enabled the Kill Switch. Public access to this development server is currently suspended.</p>
  </div>
</body>
</html>`;
  }

  private renderLockscreen(returnUrl: string, error?: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔒 Protected Tunnel — peer-port</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: radial-gradient(circle at 50% 0%, #161b22, #0d1117 80%); color: #e6edf3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .card { background: rgba(22, 27, 34, 0.9); border: 1px solid rgba(240, 246, 252, 0.15); border-radius: 16px; padding: 2.5rem 2rem; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); backdrop-filter: blur(16px); }
    .lock-icon { font-size: 2.5rem; margin-bottom: 1rem; display: inline-block; background: rgba(88, 166, 255, 0.15); padding: 1rem; border-radius: 50%; line-height: 1; }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.9rem; color: #8b949e; margin-bottom: 1.8rem; }
    .input-box { width: 100%; padding: 0.85rem 1rem; background: #0d1117; border: 1px solid rgba(240, 246, 252, 0.2); border-radius: 8px; color: #fff; font-size: 1.3rem; letter-spacing: 4px; text-align: center; margin-bottom: 1rem; outline: none; }
    .input-box:focus { border-color: #58a6ff; }
    .btn { width: 100%; padding: 0.85rem; background: #238636; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .btn:hover { background: #2ea043; }
    .error-msg { background: rgba(248, 81, 73, 0.15); color: #f85149; padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.2rem; border: 1px solid rgba(248, 81, 73, 0.3); }
  </style>
</head>
<body>
  <div class="card">
    <div class="lock-icon">🔒</div>
    <h1>Access Protected</h1>
    <p>This development tunnel requires a PIN to access.</p>
    ${error ? `<div class="error-msg">${error}</div>` : ''}
    <form method="POST" action="/__peer_auth">
      <input type="hidden" name="returnUrl" value="${escapeHtml(returnUrl)}" />
      <input type="password" name="pin" class="input-box" placeholder="••••" autofocus required />
      <button type="submit" class="btn">Unlock & Enter</button>
    </form>
  </div>
</body>
</html>`;
  }

  public async start(requestedPort?: number): Promise<number> {
    const portToUse = requestedPort || (process.env.PORT ? parseInt(process.env.PORT, 10) : 0);
    return new Promise((resolve, reject) => {
      this.server.listen(portToUse, '0.0.0.0', () => {
        const addr = this.server.address();
        if (typeof addr === 'object' && addr) {
          this.port = addr.port;
          resolve(this.port);
        } else {
          reject(new Error('Failed to obtain server address.'));
        }
      });
    });
  }

  public close(): void {
    this.server.close();
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}
