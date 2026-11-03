import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Automatically load .env file if present
function loadEnv() {
  try {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile();
    }
  } catch (e) {}

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const k = key.trim();
          if (k && !process.env[k]) {
            process.env[k] = rest.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  } catch (e) {}
}

loadEnv();

export interface FeedbackItem {
  id: string;
  comment: string;
  selector: string;
  elementText: string;
  url: string;
  screenSize: string;
  userAgent: string;
  resolved: boolean;
  timestamp: number;
}

export interface SubRequestItem {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  type: string; // 'document' | 'script' | 'style' | 'image' | 'api' | 'other'
  timestamp: number;
}

export interface ParentRequestGroup {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  ip: string;
  timestamp: number;
  subRequests: SubRequestItem[];
}

export interface RemoteTunnelInfo {
  id: string;
  publicUrl: string;
  target: string;
  clientIp: string;
  startedAt: number;
  lastPing: number;
  totalRequests: number;
  activeRequests: number;
  uniqueVisitors: number;
  avgLatency: number;
  isPaused: boolean;
  disabledPages: string[];
  requestGroups: ParentRequestGroup[];
  feedbacks: FeedbackItem[];
}

export class AdminTelemetry {
  public publicUrl = '';
  public targetHost = 'localhost';
  public targetPort = 3000;
  public startedAt = Date.now();
  public totalRequests = 0;
  public activeRequests = 0;
  public totalDuration = 0;
  public uniqueVisitors = new Set<string>();
  public requestGroups: ParentRequestGroup[] = [];
  public currentParentGroup: ParentRequestGroup | null = null;
  public feedbacks: FeedbackItem[] = [];
  public isPaused = false; // Master kill switch
  public disabledPages = new Set<string>(); // Route/Page blocklist
  public adminPassword: string;

  public remoteTunnels = new Map<string, RemoteTunnelInfo>();

  public statusCounts: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };

  constructor(adminPassword?: string) {
    // Reload env to ensure fresh values
    loadEnv();
    this.adminPassword = adminPassword || process.env.ADMIN_PASSWORD || 'admin_Ankit@1320';
  }

  public setPublicUrl(url: string): void {
    this.publicUrl = url;
  }

  public registerRemoteTunnel(info: any, clientIp: string): RemoteTunnelInfo {
    const tunnel: RemoteTunnelInfo = {
      id: info.id || 'tun_' + Math.random().toString(36).substring(2, 9),
      publicUrl: info.publicUrl || '',
      target: info.target || 'localhost:3000',
      clientIp: clientIp || '127.0.0.1',
      startedAt: info.startedAt || Date.now(),
      lastPing: Date.now(),
      totalRequests: info.totalRequests || 0,
      activeRequests: info.activeRequests || 0,
      uniqueVisitors: info.uniqueVisitors || 1,
      avgLatency: info.avgLatency || 0,
      isPaused: false,
      disabledPages: [],
      requestGroups: [],
      feedbacks: [],
    };
    this.remoteTunnels.set(tunnel.id, tunnel);
    return tunnel;
  }

  public updateRemoteTunnel(info: any): RemoteTunnelInfo | undefined {
    const tunnel = this.remoteTunnels.get(info.id);
    if (!tunnel) return undefined;
    tunnel.lastPing = Date.now();
    if (info.publicUrl) tunnel.publicUrl = info.publicUrl;
    if (info.totalRequests !== undefined) tunnel.totalRequests = info.totalRequests;
    if (info.activeRequests !== undefined) tunnel.activeRequests = info.activeRequests;
    if (info.uniqueVisitors !== undefined) tunnel.uniqueVisitors = info.uniqueVisitors;
    if (info.avgLatency !== undefined) tunnel.avgLatency = info.avgLatency;
    if (info.requestGroups) tunnel.requestGroups = info.requestGroups;
    if (info.feedbacks) tunnel.feedbacks = info.feedbacks;
    return tunnel;
  }

  public pruneInactiveTunnels(): void {
    const now = Date.now();
    for (const [id, t] of this.remoteTunnels.entries()) {
      if (now - t.lastPing > 15000) {
        this.remoteTunnels.delete(id);
      }
    }
  }

  public getAssetType(url: string, headers: Record<string, any>): string {
    const path = url.split('?')[0].toLowerCase();
    if (path.endsWith('.js') || path.endsWith('.mjs')) return 'script';
    if (path.endsWith('.css')) return 'style';
    if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'image';
    if (path.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (path.startsWith('/api/') || headers['accept']?.includes('application/json')) return 'api';
    return 'document';
  }

  public recordRequestStart(): void {
    this.totalRequests++;
    this.activeRequests++;
  }

  public recordRequestEnd(
    method: string,
    url: string,
    status: number,
    duration: number,
    ip: string,
    headers: Record<string, any>
  ): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.totalDuration += duration;
    this.uniqueVisitors.add(ip);

    const group = `${Math.floor(status / 100)}xx`;
    this.statusCounts[group] = (this.statusCounts[group] || 0) + 1;

    const assetType = this.getAssetType(url, headers);
    const subItem: SubRequestItem = {
      id: Math.random().toString(36).substring(2, 9),
      method,
      url,
      status,
      duration,
      type: assetType,
      timestamp: Date.now(),
    };

    if (assetType === 'document' || !this.currentParentGroup) {
      const parentGroup: ParentRequestGroup = {
        id: 'req_' + Math.random().toString(36).substring(2, 9),
        method,
        url,
        status,
        duration,
        ip,
        timestamp: Date.now(),
        subRequests: [subItem],
      };
      this.currentParentGroup = parentGroup;
      this.requestGroups.unshift(parentGroup);
      if (this.requestGroups.length > 50) this.requestGroups.pop();
    } else {
      this.currentParentGroup.subRequests.push(subItem);
    }
  }

  public addFeedback(item: Omit<FeedbackItem, 'id' | 'resolved'>): FeedbackItem {
    const feedback: FeedbackItem = {
      ...item,
      id: 'fb_' + Math.random().toString(36).substring(2, 9),
      resolved: false,
    };
    this.feedbacks.unshift(feedback);
    return feedback;
  }

  public toggleDisablePage(route: string): boolean {
    const cleanRoute = route.trim().toLowerCase();
    if (this.disabledPages.has(cleanRoute)) {
      this.disabledPages.delete(cleanRoute);
      return false; // unbanned
    } else {
      this.disabledPages.add(cleanRoute);
      return true; // banned
    }
  }

  public isPageDisabled(urlPath: string): boolean {
    const cleanPath = urlPath.split('?')[0].toLowerCase();
    for (const disabled of this.disabledPages) {
      if (cleanPath === disabled || cleanPath.startsWith(disabled + '/')) {
        return true;
      }
    }
    return false;
  }

  public getStats() {
    this.pruneInactiveTunnels();
    const avgLatency = this.totalRequests > 0 ? Math.round(this.totalDuration / this.totalRequests) : 0;
    const effectiveUrl = this.publicUrl || `http://${this.targetHost}:${this.targetPort}`;

    const tunnelsList: Array<{
      id: string;
      publicUrl: string;
      target: string;
      startedAt: number;
      totalRequests: number;
      uniqueVisitors: number;
      avgLatency: number;
      isPaused: boolean;
      disabledPages: string[];
      requestGroups: ParentRequestGroup[];
      feedbacks: FeedbackItem[];
    }> = [];

    // Add remote user tunnels first
    for (const t of this.remoteTunnels.values()) {
      tunnelsList.push({
        id: t.id,
        publicUrl: t.publicUrl,
        target: t.target,
        startedAt: t.startedAt,
        totalRequests: t.totalRequests,
        uniqueVisitors: t.uniqueVisitors,
        avgLatency: t.avgLatency,
        isPaused: t.isPaused,
        disabledPages: t.disabledPages,
        requestGroups: t.requestGroups,
        feedbacks: t.feedbacks,
      });
    }

    // Include local tunnel if active (has publicUrl) or running locally without remote tunnels
    const isRender = Boolean(process.env.RENDER);
    if ((!isRender && tunnelsList.length === 0) || (this.publicUrl && !this.publicUrl.includes('onrender.com'))) {
      tunnelsList.push({
        id: 'local_tunnel',
        publicUrl: effectiveUrl,
        target: `http://${this.targetHost}:${this.targetPort}`,
        startedAt: this.startedAt,
        totalRequests: this.totalRequests,
        uniqueVisitors: this.uniqueVisitors.size,
        avgLatency,
        isPaused: this.isPaused,
        disabledPages: Array.from(this.disabledPages),
        requestGroups: this.requestGroups.slice(0, 50),
        feedbacks: this.feedbacks,
      });
    }

    return {
      publicUrl: effectiveUrl,
      targetHost: this.targetHost,
      targetPort: this.targetPort,
      startedAt: this.startedAt,
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      uniqueVisitors: this.uniqueVisitors.size,
      avgLatency,
      isPaused: this.isPaused,
      disabledPages: Array.from(this.disabledPages),
      statusCounts: this.statusCounts,
      feedbacksCount: this.feedbacks.filter((f) => !f.resolved).length,
      requestGroups: this.requestGroups.slice(0, 50),
      feedbacks: this.feedbacks,
      tunnels: tunnelsList,
    };
  }

  public renderAdminLoginHtml(error?: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔒 Admin Authentication — peer-port</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: radial-gradient(circle at 50% 0%, #161b22, #0d1117 80%); color: #e6edf3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .card { background: rgba(22, 27, 34, 0.95); border: 1px solid rgba(240, 246, 252, 0.15); border-radius: 16px; padding: 2.5rem 2rem; max-width: 380px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); backdrop-filter: blur(16px); }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.85rem; color: #8b949e; margin-bottom: 1.5rem; }
    input { width: 100%; padding: 0.85rem 1rem; background: #0d1117; border: 1px solid rgba(240, 246, 252, 0.2); border-radius: 8px; color: #fff; font-size: 1.1rem; text-align: center; margin-bottom: 1rem; outline: none; }
    input:focus { border-color: #58a6ff; }
    button { width: 100%; padding: 0.85rem; background: #238636; color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { background: #2ea043; }
    .error { background: rgba(248, 81, 73, 0.15); color: #f85149; padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.2rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛡️</div>
    <h1>Admin Access</h1>
    <p>Enter your Admin Password to access the live controls.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/__peer_admin_login">
      <input type="password" name="password" placeholder="Admin Password" autofocus required />
      <button type="submit">Sign In to Dashboard</button>
    </form>
  </div>
</body>
</html>`;
  }

  public renderAdminDashboardHtml(): string {
    const stats = this.getStats();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ peer-port — Executive Admin Center</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: radial-gradient(circle at 50% 0%, #161b22, #0d1117 80%);
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: rgba(22, 27, 34, 0.95);
      border-bottom: 1px solid rgba(240, 246, 252, 0.1);
      padding: 0.9rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(12px);
      position: sticky; top: 0; z-index: 100;
    }
    .logo { font-size: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .status-pill {
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 9999px;
      font-weight: 600;
      display: flex; align-items: center; gap: 6px;
    }
    .status-pill.live { background: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid #3fb950; }
    .status-pill.paused { background: rgba(248, 81, 73, 0.2); color: #f85149; border: 1px solid #f85149; }
    .tabs { display: flex; gap: 6px; }
    .tab-btn {
      background: transparent;
      border: 1px solid rgba(240, 246, 252, 0.1);
      color: #8b949e;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .tab-btn.active { background: #58a6ff; color: #0d1117; border-color: #58a6ff; }
    main { max-width: 1250px; width: 100%; margin: 0 auto; padding: 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
    
    /* KILL SWITCH TOP BANNER */
    .kill-banner {
      background: #161b22;
      border: 1px solid rgba(240, 246, 252, 0.15);
      border-radius: 12px;
      padding: 1.2rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .kill-info h3 { font-size: 1.1rem; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .kill-info p { font-size: 0.85rem; color: #8b949e; }
    .btn-toggle-kill {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-toggle-kill.active-live { background: #da3633; color: #fff; }
    .btn-toggle-kill.active-live:hover { background: #f85149; }
    .btn-toggle-kill.active-paused { background: #238636; color: #fff; }
    .btn-toggle-kill.active-paused:hover { background: #2ea043; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background: rgba(22, 27, 34, 0.85);
      border: 1px solid rgba(240, 246, 252, 0.1);
      padding: 1rem 1.2rem;
      border-radius: 12px;
    }
    .stat-title { font-size: 0.75rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: #58a6ff; margin-top: 4px; }
    
    .panel {
      background: rgba(22, 27, 34, 0.85);
      border: 1px solid rgba(240, 246, 252, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      flex: 1;
    }
    .panel-header {
      margin-bottom: 1.2rem;
    }
    .panel-header h2 { font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .panel-header p { font-size: 0.85rem; color: #8b949e; }

    /* HOSTED WEBSITES TABLE */
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; padding: 12px 14px; border-bottom: 1px solid rgba(240, 246, 252, 0.15); color: #8b949e; font-weight: 600; }
    td { padding: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); vertical-align: middle; }
    
    .website-row {
      background: rgba(255, 255, 255, 0.02);
      transition: background 0.15s;
    }
    .website-row:hover { background: rgba(88, 166, 255, 0.04); }

    .tunnel-link {
      color: #58a6ff;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tunnel-link:hover { text-decoration: underline; }

    .btn-copy {
      background: rgba(240, 246, 252, 0.08);
      border: 1px solid rgba(240, 246, 252, 0.15);
      color: #8b949e;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 0.75rem;
      cursor: pointer;
      margin-left: 6px;
    }
    .btn-copy:hover { color: #fff; background: rgba(240, 246, 252, 0.15); }

    .status-badge-live {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid #3fb950;
      padding: 3px 10px; border-radius: 9999px; font-weight: 600; font-size: 0.78rem;
    }
    .status-badge-paused {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(248, 81, 73, 0.15); color: #f85149; border: 1px solid #f85149;
      padding: 3px 10px; border-radius: 9999px; font-weight: 600; font-size: 0.78rem;
    }

    .btn-actions-group {
      display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
    }
    .btn-live-preview {
      background: rgba(88, 166, 255, 0.15);
      border: 1px solid #58a6ff;
      color: #58a6ff;
      padding: 7px 13px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px;
      transition: all 0.15s;
    }
    .btn-live-preview:hover { background: #58a6ff; color: #0d1117; }

    .btn-row-kill {
      padding: 7px 13px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex; align-items: center; gap: 5px;
      transition: all 0.15s;
    }
    .btn-row-kill.kill {
      background: rgba(248, 81, 73, 0.15); border-color: #da3633; color: #f85149;
    }
    .btn-row-kill.kill:hover { background: #da3633; color: #fff; }
    .btn-row-kill.resume {
      background: rgba(63, 185, 80, 0.15); border-color: #238636; color: #3fb950;
    }
    .btn-row-kill.resume:hover { background: #238636; color: #fff; }

    .btn-see-requests {
      background: #21262d;
      border: 1px solid rgba(240, 246, 252, 0.2);
      color: #e6edf3;
      padding: 7px 13px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px;
      transition: all 0.15s;
    }
    .btn-see-requests:hover { border-color: #58a6ff; color: #58a6ff; }

    /* MODAL SYSTEM */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px);
      display: none; align-items: center; justify-content: center; z-index: 999; padding: 1.5rem;
    }
    .modal-backdrop.open { display: flex; }
    .modal-container {
      background: #161b22; border: 1px solid rgba(240, 246, 252, 0.15); border-radius: 14px;
      width: 100%; max-width: 1100px; max-height: 90vh; display: flex; flex-direction: column;
      overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.8);
    }
    .modal-header {
      padding: 1.1rem 1.5rem; border-bottom: 1px solid rgba(240, 246, 252, 0.1);
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(22, 27, 34, 0.95);
    }
    .modal-header h3 { font-size: 1.15rem; display: flex; align-items: center; gap: 8px; }
    .btn-close-modal {
      background: transparent; border: none; color: #8b949e; font-size: 1.5rem; cursor: pointer; line-height: 1; padding: 0 4px;
    }
    .btn-close-modal:hover { color: #fff; }
    .modal-body {
      padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.25rem;
    }

    /* DEVICE PREVIEW TOOLBAR */
    .preview-toolbar {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem;
      background: #0d1117; padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(240,246,252,0.1);
    }
    .device-buttons { display: flex; gap: 6px; }
    .device-btn {
      background: transparent; border: 1px solid rgba(240,246,252,0.15); color: #8b949e;
      padding: 5px 12px; border-radius: 5px; font-size: 0.8rem; cursor: pointer; font-weight: 600;
    }
    .device-btn.active { background: #58a6ff; color: #0d1117; border-color: #58a6ff; }
    .frame-container {
      width: 100%; margin: 0 auto; transition: max-width 0.25s ease;
      background: #000; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    #preview-iframe {
      width: 100%; height: 580px; border: none; background: #fff; display: block;
    }

    /* GROUPED HIERARCHICAL REQUESTS TABLE (Inside Modal) */
    .parent-row {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.02);
      transition: background 0.15s;
    }
    .parent-row:hover { background: rgba(88, 166, 255, 0.06); }
    .parent-row td { font-weight: 600; padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-family: monospace; }
    .child-row {
      background: #090d13;
      display: none;
    }
    .child-row.open { display: table-row; }
    .child-row td {
      padding: 8px 14px 8px 38px;
      font-size: 0.8rem;
      color: #8b949e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-family: monospace;
    }
    .expand-arrow { display: inline-block; width: 16px; transition: transform 0.2s; color: #58a6ff; }
    .expand-arrow.open { transform: rotate(90deg); }

    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-get { background: rgba(63, 185, 80, 0.15); color: #3fb950; }
    .badge-post { background: rgba(88, 166, 255, 0.15); color: #58a6ff; }
    .badge-put { background: rgba(210, 153, 34, 0.15); color: #d29922; }
    .badge-delete { background: rgba(248, 81, 73, 0.15); color: #f85149; }
    .badge-head { background: rgba(139, 148, 158, 0.15); color: #8b949e; }
    .status-2xx { color: #3fb950; }
    .status-3xx { color: #58a6ff; }
    .status-4xx { color: #d29922; }
    .status-5xx { color: #f85149; font-weight: 600; }
    
    .action-btn-ban {
      background: rgba(248, 81, 73, 0.12);
      border: 1px solid rgba(248, 81, 73, 0.3);
      color: #f85149;
      padding: 4px 9px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .action-btn-ban:hover { background: #da3633; color: #fff; }

    .action-btn-unban {
      background: rgba(63, 185, 80, 0.15);
      border: 1px solid #3fb950;
      color: #3fb950;
      padding: 4px 9px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }
    .action-btn-unban:hover { background: #238636; color: #fff; }

    /* PAGE BLOCKLIST STYLES */
    .ban-page-box {
      display: flex; gap: 8px; margin-bottom: 0.75rem;
    }
    .ban-page-box input {
      flex: 1; max-width: 320px;
      background: #0d1117;
      border: 1px solid rgba(240, 246, 252, 0.2);
      border-radius: 6px;
      padding: 8px 12px;
      color: #fff; font-size: 0.9rem;
    }
    .ban-page-box button {
      background: #da3633; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;
    }

    .feedback-card {
      background: #0d1117;
      border: 1px solid rgba(240, 246, 252, 0.15);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .feedback-card.resolved { opacity: 0.5; border-color: rgba(63, 185, 80, 0.3); }
    .feedback-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem; color: #8b949e; }
    .feedback-body { font-size: 0.95rem; color: #fff; margin-bottom: 0.5rem; }
    .feedback-meta { font-family: monospace; font-size: 0.75rem; color: #58a6ff; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span>⚡ peer-port</span>
      <span style="font-size: 0.8rem; color: #8b949e; font-weight: normal;">Executive Admin Center</span>
      <div id="status-badge" class="status-pill ${stats.isPaused ? 'paused' : 'live'}">
        ${stats.isPaused ? '🔴 ACCESS PAUSED' : '🟢 LIVE & STREAMING'}
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('websites', this)">🌐 Hosted Websites (${stats.tunnels.length})</button>
      <button class="tab-btn" onclick="switchTab('feedback', this)">📌 Bug Reports (${stats.feedbacksCount})</button>
      <button class="tab-btn" onclick="switchTab('pages', this)">🚫 Blocked Pages (${stats.disabledPages.length})</button>
    </div>
  </header>

  <main>
    <!-- KILL SWITCH TOP BANNER -->
    <div class="kill-banner">
      <div class="kill-info">
        <h3 id="kill-title">${stats.isPaused ? '⚠️ Public Link is PAUSED' : '🟢 Public Link is ACTIVE'}</h3>
        <p id="kill-desc">${
          stats.isPaused
            ? 'Visitors are currently blocked with a 503 Maintenance screen. Your local app is completely private.'
            : 'Anyone with the link can access your website. Click the kill switch to instantly freeze external access.'
        }</p>
      </div>
      <div>
        <button id="btn-kill" class="btn-toggle-kill ${stats.isPaused ? 'active-paused' : 'active-live'}" onclick="toggleKillSwitch('local_tunnel')">
          ${stats.isPaused ? '▶ Resume Public Access' : '🛑 KILL SWITCH (Pause Access)'}
        </button>
      </div>
    </div>

    <!-- STATS OVERVIEW -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Active Requests</div>
        <div class="stat-value" id="val-active">${stats.activeRequests}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Total Requests</div>
        <div class="stat-value" id="val-total">${stats.totalRequests}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Unique Visitors</div>
        <div class="stat-value" id="val-visitors">${stats.uniqueVisitors}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Avg Latency</div>
        <div class="stat-value" id="val-latency">${stats.avgLatency} ms</div>
      </div>
    </div>

    <!-- TAB 1: HOSTED WEBSITES TABLE -->
    <div class="panel" id="panel-websites">
      <div class="panel-header">
        <h2>🌐 Hosted Websites & Active Public Links</h2>
        <p>Manage your live tunnels, preview website interfaces, toggle instant kill switches, and inspect request trees.</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Hosted Website / Public Link</th>
            <th>Local Destination</th>
            <th>Status</th>
            <th>Activity Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="table-websites">
          ${stats.tunnels.length === 0
            ? '<tr><td colspan="5" style="text-align: center; color: #8b949e; padding: 3rem 1rem;">⚡ No active developer tunnels connected.<br><span style="font-size: 0.85rem; color: #58a6ff; margin-top: 6px; display: inline-block;">Run <code>npx peer-port 3000</code> in your or your friend\'s terminal to share localhost and see it appear here live!</span></td></tr>'
            : stats.tunnels
            .map(
              (t) => `
            <tr class="website-row" id="row-${t.id}">
              <td>
                <a href="${t.publicUrl}" target="_blank" class="tunnel-link" id="site-link-${t.id}">
                  ${t.publicUrl} ↗
                </a>
                <button class="btn-copy" onclick="copyText('${t.publicUrl}')" title="Copy public link">📋 Copy</button>
              </td>
              <td style="font-family: monospace; color: #8b949e;" id="site-target-${t.id}">
                ${t.target}
              </td>
              <td id="site-status-badge-${t.id}">
                ${t.isPaused ? '<span class="status-badge-paused">🔴 PAUSED (503)</span>' : '<span class="status-badge-live">🟢 LIVE & ONLINE</span>'}
              </td>
              <td id="site-activity-summary-${t.id}" style="color: #e6edf3; font-weight: 500;">
                ${t.totalRequests} reqs • ${t.uniqueVisitors} visitors • ${t.avgLatency}ms avg
              </td>
              <td>
                <div class="btn-actions-group">
                  <button class="btn-live-preview" onclick="openLivePreviewModal('${t.publicUrl}')" title="Live Preview Website">
                    👁️ Live Preview
                  </button>
                  <button id="btn-row-kill-${t.id}" class="btn-row-kill ${t.isPaused ? 'resume' : 'kill'}" onclick="toggleKillSwitch('${t.id}')" title="Toggle Kill Switch">
                    ${t.isPaused ? '▶ Resume' : '🛑 Kill Switch'}
                  </button>
                  <button class="btn-see-requests" onclick="openRequestsModal('${t.id}')" title="Inspect child requests & statistics">
                    📊 See Requests & Statistics
                  </button>
                </div>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- TAB 2: BUG REPORTS -->
    <div class="panel" id="panel-feedback" style="display: none;">
      <div class="panel-header">
        <h2>📌 Client Sticky Notes & Bug Reports</h2>
        <p>Interactive feedback submitted by clients using the floating "Drop Comment" badge on your website.</p>
      </div>
      <div id="feedback-list">
        ${
          stats.feedbacks.length === 0
            ? '<p style="color: #8b949e;">No feedback submitted yet. Clients can click the floating "Drop Comment" badge on the website.</p>'
            : stats.feedbacks
                .map(
                  (f) => `
          <div class="feedback-card ${f.resolved ? 'resolved' : ''}">
            <div class="feedback-header">
              <span>📍 Route: ${f.url}</span>
              <span>📱 Screen: ${f.screenSize} • ${new Date(f.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="feedback-body">💬 "${escapeHtml(f.comment)}"</div>
            <div class="feedback-meta">🎯 Element: ${escapeHtml(f.selector)} ${
                    f.elementText ? `("${escapeHtml(f.elementText)}")` : ''
                  }</div>
            <div>
              <button class="device-btn" onclick="toggleResolveFeedback('${f.id}')">
                ${f.resolved ? '↩ Re-open' : '✔ Mark Resolved'}
              </button>
            </div>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>

    <!-- TAB 3: DISABLED PAGES BLOCKLIST -->
    <div class="panel" id="panel-pages" style="display: none;">
      <div class="panel-header">
        <h2>🚫 Blocked Pages (Route-Level Security)</h2>
        <p>Disabled routes return a 403 Forbidden screen to visitors while the rest of your website remains fully accessible.</p>
      </div>

      <div class="ban-page-box">
        <input type="text" id="input-ban-route" placeholder="e.g. /checkout or /admin or /settings" />
        <button onclick="addBanRoute()">Disable This Page</button>
      </div>

      <div id="disabled-pages-list">
        ${
          stats.disabledPages.length === 0
            ? '<p style="color: #8b949e;">No pages are currently disabled. All website routes are accessible.</p>'
            : stats.disabledPages
                .map(
                  (page) => `
          <div style="background: #0d1117; border: 1px solid rgba(240,246,252,0.1); padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace; color: #f85149; font-weight: 600;">🚫 ${page}</span>
            <button class="action-btn-unban" onclick="unbanPage('${page}')">✔ Re-enable Page</button>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  </main>

  <!-- MODAL 1: LIVE PREVIEW MODAL -->
  <div class="modal-backdrop" id="modal-preview" onclick="if(event.target === this) closeLivePreviewModal()">
    <div class="modal-container" style="max-width: 1000px;">
      <div class="modal-header">
        <h3>👁️ Live Website Preview — <span id="preview-modal-url" style="color: #58a6ff; font-weight: normal; font-size: 0.95rem;">${stats.publicUrl}</span></h3>
        <button class="btn-close-modal" onclick="closeLivePreviewModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="preview-toolbar">
          <div class="device-buttons">
            <button class="device-btn active" id="btn-dev-desk" onclick="setPreviewDevice('desktop')">🖥️ Desktop (100%)</button>
            <button class="device-btn" id="btn-dev-tab" onclick="setPreviewDevice('tablet')">💻 Tablet (768px)</button>
            <button class="device-btn" id="btn-dev-mob" onclick="setPreviewDevice('mobile')">📱 Mobile (375px)</button>
          </div>
          <div>
            <a id="preview-new-tab" href="/" target="_blank" style="color: #58a6ff; font-size: 0.82rem; text-decoration: none; font-weight: 600;">Open in New Tab ↗</a>
          </div>
        </div>

        <div class="frame-container" id="frame-wrap" style="max-width: 100%;">
          <iframe id="preview-iframe" src="about:blank"></iframe>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 2: REQUESTS & STATISTICS MODAL -->
  <div class="modal-backdrop" id="modal-requests" onclick="if(event.target === this) closeRequestsModal()">
    <div class="modal-container" style="max-width: 1100px;">
      <div class="modal-header">
        <h3>📊 Requests & Performance Analytics — <span id="req-modal-url" style="color: #58a6ff; font-weight: normal; font-size: 0.95rem;">${stats.publicUrl}</span></h3>
        <button class="btn-close-modal" onclick="closeRequestsModal()">✕</button>
      </div>
      <div class="modal-body">
        <!-- Quick stats bar inside modal -->
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">2xx Success</div>
            <div class="stat-value" id="modal-val-2xx" style="color: #3fb950; font-size: 1.3rem;">${stats.statusCounts['2xx'] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">3xx Redirects</div>
            <div class="stat-value" id="modal-val-3xx" style="color: #58a6ff; font-size: 1.3rem;">${stats.statusCounts['3xx'] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">4xx Client Errors</div>
            <div class="stat-value" id="modal-val-4xx" style="color: #d29922; font-size: 1.3rem;">${stats.statusCounts['4xx'] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">5xx Server Errors</div>
            <div class="stat-value" id="modal-val-5xx" style="color: #f85149; font-size: 1.3rem;">${stats.statusCounts['5xx'] || 0}</div>
          </div>
        </div>

        <!-- Disable Page Tool inside modal -->
        <div style="background: rgba(22, 27, 34, 0.6); border: 1px solid rgba(240,246,252,0.1); border-radius: 8px; padding: 12px 14px;">
          <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">🚫 Disable Page Control</div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="modal-input-ban" placeholder="Enter route e.g. /checkout or /about" style="flex: 1; max-width: 320px; background: #0d1117; border: 1px solid rgba(240,246,252,0.2); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 0.85rem;" />
            <button onclick="modalAddBanRoute()" style="background: #da3633; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">🚫 Disable Page</button>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.95rem; margin-bottom: 8px; color: #e6edf3;">Grouped Page Requests & Sub-Assets (Click row to expand child assets)</h4>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;"></th>
                <th>Method</th>
                <th>Primary Route / Page</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Sub-requests</th>
                <th>IP Address</th>
                <th>Time</th>
                <th>Page Action</th>
              </tr>
            </thead>
            <tbody id="modal-table-traffic">
              ${stats.requestGroups
                .map((group) => {
                  const isBanned = stats.disabledPages.includes(group.url.toLowerCase());
                  return `
                <tr class="parent-row" onclick="toggleGroup('${group.id}')">
                  <td><span class="expand-arrow" id="arrow-${group.id}">▶</span></td>
                  <td><span class="badge badge-${group.method.toLowerCase()}">${group.method}</span></td>
                  <td style="color: #fff;">${group.url}</td>
                  <td class="status-${Math.floor(group.status / 100)}xx">${group.status}</td>
                  <td>${group.duration}ms</td>
                  <td style="color: #58a6ff;">${group.subRequests.length} sub-assets</td>
                  <td>${group.ip}</td>
                  <td>${new Date(group.timestamp).toLocaleTimeString()}</td>
                  <td>
                    ${
                      isBanned
                        ? `<button class="action-btn-unban" onclick="event.stopPropagation(); unbanPage('${group.url}')" title="Re-enable page">✅ Enable Page</button>`
                        : `<button class="action-btn-ban" onclick="event.stopPropagation(); banPage('${group.url}')" title="Disable this page">🚫 Disable Page</button>`
                    }
                  </td>
                </tr>
                ${group.subRequests
                  .map(
                    (sub) => `
                  <tr class="child-row child-of-${group.id}">
                    <td></td>
                    <td><span style="font-size: 0.7rem; color: #8b949e;">${sub.method}</span></td>
                    <td>↳ ${sub.url} <span style="font-size: 0.7rem; color: #58a6ff;">(${sub.type})</span></td>
                    <td class="status-${Math.floor(sub.status / 100)}xx">${sub.status}</td>
                    <td>${sub.duration}ms</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${new Date(sub.timestamp).toLocaleTimeString()}</td>
                    <td></td>
                  </tr>
                `
                  )
                  .join('')}
              `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentStats = ${JSON.stringify(stats)};
    let activeModalTunnelId = 'local_tunnel';

    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-websites').style.display = tab === 'websites' ? 'block' : 'none';
      document.getElementById('panel-feedback').style.display = tab === 'feedback' ? 'block' : 'none';
      document.getElementById('panel-pages').style.display = tab === 'pages' ? 'block' : 'none';
    }

    function toggleGroup(id) {
      const rows = document.querySelectorAll('.child-of-' + id);
      const arrow = document.getElementById('arrow-' + id);
      if (!arrow) return;
      const isCurrentlyOpen = arrow.classList.contains('open');

      if (isCurrentlyOpen) {
        arrow.classList.remove('open');
        rows.forEach(r => r.classList.remove('open'));
      } else {
        arrow.classList.add('open');
        rows.forEach(r => r.classList.add('open'));
      }
    }

    /* MODAL CONTROLS */
    function openLivePreviewModal(url) {
      document.getElementById('preview-iframe').src = url;
      document.getElementById('preview-modal-url').textContent = url;
      document.getElementById('preview-new-tab').href = url;
      document.getElementById('modal-preview').classList.add('open');
    }
    function closeLivePreviewModal() {
      document.getElementById('preview-iframe').src = 'about:blank';
      document.getElementById('modal-preview').classList.remove('open');
    }
    function setPreviewDevice(device) {
      const wrap = document.getElementById('frame-wrap');
      document.querySelectorAll('.device-buttons .device-btn').forEach(b => b.classList.remove('active'));
      if (device === 'mobile') {
        wrap.style.maxWidth = '375px';
        document.getElementById('btn-dev-mob').classList.add('active');
      } else if (device === 'tablet') {
        wrap.style.maxWidth = '768px';
        document.getElementById('btn-dev-tab').classList.add('active');
      } else {
        wrap.style.maxWidth = '100%';
        document.getElementById('btn-dev-desk').classList.add('active');
      }
    }

    function openRequestsModal(tunnelId = 'local_tunnel') {
      activeModalTunnelId = tunnelId;
      const targetTunnel = (currentStats.tunnels || []).find(t => t.id === tunnelId) || currentStats;
      document.getElementById('req-modal-url').textContent = targetTunnel.publicUrl;
      renderModalRequestsTable(targetTunnel);
      document.getElementById('modal-requests').classList.add('open');
    }

    function closeRequestsModal() {
      document.getElementById('modal-requests').classList.remove('open');
    }

    function renderModalRequestsTable(targetTunnel) {
      const modalTable = document.getElementById('modal-table-traffic');
      const groups = targetTunnel.requestGroups || [];
      const disabledPages = targetTunnel.disabledPages || [];

      if (!groups.length) {
        modalTable.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #8b949e; padding: 20px;">No requests recorded yet for this tunnel.</td></tr>';
        return;
      }

      modalTable.innerHTML = groups.map(group => {
        const isBanned = disabledPages.includes(group.url.toLowerCase());
        return \`
          <tr class="parent-row" onclick="toggleGroup('\${group.id}')">
            <td><span class="expand-arrow" id="arrow-\${group.id}">▶</span></td>
            <td><span class="badge badge-\${group.method.toLowerCase()}">\${group.method}</span></td>
            <td style="color: #fff;">\${group.url}</td>
            <td class="status-\${Math.floor(group.status / 100)}xx">\${group.status}</td>
            <td>\${group.duration}ms</td>
            <td style="color: #58a6ff;">\${group.subRequests.length} sub-assets</td>
            <td>\${group.ip}</td>
            <td>\${new Date(group.timestamp).toLocaleTimeString()}</td>
            <td>
              \${isBanned 
                ? \`<button class="action-btn-unban" onclick="event.stopPropagation(); unbanPage('\${group.url}')">✅ Enable Page</button>\`
                : \`<button class="action-btn-ban" onclick="event.stopPropagation(); banPage('\${group.url}')">🚫 Disable Page</button>\`
              }
            </td>
          </tr>
          \${group.subRequests.map(sub => \`
            <tr class="child-row child-of-\${group.id}">
              <td></td>
              <td><span style="font-size: 0.7rem; color: #8b949e;">\${sub.method}</span></td>
              <td>↳ \${sub.url} <span style="font-size: 0.7rem; color: #58a6ff;">(\${sub.type})</span></td>
              <td class="status-\${Math.floor(sub.status / 100)}xx">\${sub.status}</td>
              <td>\${sub.duration}ms</td>
              <td>-</td>
              <td>-</td>
              <td>\${new Date(sub.timestamp).toLocaleTimeString()}</td>
              <td></td>
            </tr>
          \`).join('')}
        \`;
      }).join('');
    }

    function copyText(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        alert('Copied link: ' + text);
      } else {
        prompt('Copy link:', text);
      }
    }

    async function sendAdminAction(action, data = {}) {
      try {
        const res = await fetch('/__peer_admin_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, tunnelId: activeModalTunnelId, ...data })
        });
        return await res.json();
      } catch (err) {
        alert('Action failed: ' + err.message);
      }
    }

    async function toggleKillSwitch(tunnelId = 'local_tunnel') {
      activeModalTunnelId = tunnelId;
      const res = await sendAdminAction('toggle_pause', { tunnelId });
      if (res && res.success) updateUIState(res.stats);
    }

    async function banPage(route) {
      const clean = route.split('?')[0];
      if (!confirm('Disable public access to page: ' + clean + '?')) return;
      const res = await sendAdminAction('toggle_disable_page', { route: clean });
      if (res && res.success) updateUIState(res.stats);
    }

    async function unbanPage(route) {
      const res = await sendAdminAction('toggle_disable_page', { route });
      if (res && res.success) updateUIState(res.stats);
    }

    async function addBanRoute() {
      const input = document.getElementById('input-ban-route');
      const val = input.value.trim();
      if (!val) return;
      const res = await sendAdminAction('toggle_disable_page', { route: val.startsWith('/') ? val : '/' + val });
      if (res && res.success) {
        input.value = '';
        updateUIState(res.stats);
      }
    }

    async function modalAddBanRoute() {
      const input = document.getElementById('modal-input-ban');
      const val = input.value.trim();
      if (!val) return;
      const res = await sendAdminAction('toggle_disable_page', { route: val.startsWith('/') ? val : '/' + val });
      if (res && res.success) {
        input.value = '';
        updateUIState(res.stats);
      }
    }

    async function toggleResolveFeedback(id) {
      const res = await sendAdminAction('toggle_resolve_feedback', { id });
      if (res && res.success) updateUIState(res.stats);
    }

    function updateUIState(data) {
      currentStats = data;
      const badge = document.getElementById('status-badge');
      const killTitle = document.getElementById('kill-title');
      const killDesc = document.getElementById('kill-desc');
      const killBtn = document.getElementById('btn-kill');

      if (data.isPaused) {
        badge.className = 'status-pill paused';
        badge.textContent = '🔴 ACCESS PAUSED';
        killTitle.textContent = '⚠️ Public Link is PAUSED';
        killDesc.textContent = 'Visitors are currently blocked with a 503 Maintenance screen. Your local app is completely private.';
        killBtn.className = 'btn-toggle-kill active-paused';
        killBtn.textContent = '▶ Resume Public Access';
      } else {
        badge.className = 'status-pill live';
        badge.textContent = '🟢 LIVE & STREAMING';
        killTitle.textContent = '🟢 Public Link is ACTIVE';
        killDesc.textContent = 'Anyone with the link can access your website. Click the kill switch to instantly freeze external access.';
        killBtn.className = 'btn-toggle-kill active-live';
        killBtn.textContent = '🛑 KILL SWITCH (Pause Access)';
      }

      document.getElementById('val-active').textContent = data.activeRequests;
      document.getElementById('val-total').textContent = data.totalRequests;
      document.getElementById('val-visitors').textContent = data.uniqueVisitors;
      document.getElementById('val-latency').textContent = data.avgLatency + ' ms';

      // Update Tunnels Table
      const tableBody = document.getElementById('table-websites');
      if (tableBody && data.tunnels) {
        if (data.tunnels.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #8b949e; padding: 3rem 1rem;">⚡ No active developer tunnels connected.<br><span style="font-size: 0.85rem; color: #58a6ff; margin-top: 6px; display: inline-block;">Run <code>npx peer-port 3000</code> in your or your friend\\\'s terminal to share localhost and see it appear here live!</span></td></tr>';
        } else {
          tableBody.innerHTML = data.tunnels.map(t => \`
            <tr class="website-row" id="row-\${t.id}">
              <td>
                <a href="\${t.publicUrl}" target="_blank" class="tunnel-link" id="site-link-\${t.id}">
                  \${t.publicUrl} ↗
                </a>
                <button class="btn-copy" onclick="copyText('\${t.publicUrl}')" title="Copy public link">📋 Copy</button>
              </td>
              <td style="font-family: monospace; color: #8b949e;" id="site-target-\${t.id}">
                \${t.target}
              </td>
              <td id="site-status-badge-\${t.id}">
                \${t.isPaused ? '<span class="status-badge-paused">🔴 PAUSED (503)</span>' : '<span class="status-badge-live">🟢 LIVE & ONLINE</span>'}
              </td>
              <td id="site-activity-summary-\${t.id}" style="color: #e6edf3; font-weight: 500;">
                \${t.totalRequests} reqs • \${t.uniqueVisitors} visitors • \${t.avgLatency}ms avg
              </td>
              <td>
                <div class="btn-actions-group">
                  <button class="btn-live-preview" onclick="openLivePreviewModal('\${t.publicUrl}')" title="Live Preview Website">
                    👁️ Live Preview
                  </button>
                  <button id="btn-row-kill-\${t.id}" class="btn-row-kill \${t.isPaused ? 'resume' : 'kill'}" onclick="toggleKillSwitch('\${t.id}')" title="Toggle Kill Switch">
                    \${t.isPaused ? '▶ Resume' : '🛑 Kill Switch'}
                  </button>
                  <button class="btn-see-requests" onclick="openRequestsModal('\${t.id}')" title="Inspect child requests & statistics">
                    📊 See Requests & Statistics
                  </button>
                </div>
              </td>
            </tr>
          \`).join('');
        }
      }

      // Update Modal if open
      const targetTunnel = (data.tunnels || []).find(t => t.id === activeModalTunnelId) || data;
      renderModalRequestsTable(targetTunnel);
    }

    // Auto-refresh every 2.5 seconds
    setInterval(async () => {
      try {
        const res = await fetch('/__peer_admin_data');
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        const data = await res.json();
        updateUIState(data);
      } catch (err) {}
    }, 2500);
  </script>
</body>
</html>`;
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
