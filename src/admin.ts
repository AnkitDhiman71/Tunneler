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

export class AdminTelemetry {
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

  public statusCounts: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };

  constructor(adminPassword?: string) {
    // Generate or use provided admin password
    this.adminPassword = adminPassword || 'admin' + Math.floor(1000 + Math.random() * 9000);
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

    // If it's a primary document or API root, create a new Parent Request Group
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
      // Group sub-requests (CSS, JS, images, icons) under current parent page request
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
    const avgLatency = this.totalRequests > 0 ? Math.round(this.totalDuration / this.totalRequests) : 0;
    return {
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      uniqueVisitors: this.uniqueVisitors.size,
      avgLatency,
      isPaused: this.isPaused,
      disabledPages: Array.from(this.disabledPages),
      statusCounts: this.statusCounts,
      feedbacksCount: this.feedbacks.filter((f) => !f.resolved).length,
      requestGroups: this.requestGroups.slice(0, 30),
      feedbacks: this.feedbacks,
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
    
    /* KILL SWITCH BANNER */
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
    .panel h2 { font-size: 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }

    /* GROUPED HIERARCHICAL REQUESTS TABLE */
    .parent-row {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.02);
      transition: background 0.15s;
    }
    .parent-row:hover { background: rgba(88, 166, 255, 0.06); }
    .parent-row td { font-weight: 600; padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
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
    }
    .expand-arrow { display: inline-block; width: 16px; transition: transform 0.2s; color: #58a6ff; }
    .expand-arrow.open { transform: rotate(90deg); }

    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; font-family: monospace; }
    th { text-align: left; padding: 10px 14px; border-bottom: 1px solid rgba(240, 246, 252, 0.1); color: #8b949e; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-get { background: rgba(63, 185, 80, 0.15); color: #3fb950; }
    .badge-post { background: rgba(88, 166, 255, 0.15); color: #58a6ff; }
    .badge-put { background: rgba(210, 153, 34, 0.15); color: #d29922; }
    .badge-delete { background: rgba(248, 81, 73, 0.15); color: #f85149; }
    .status-2xx { color: #3fb950; }
    .status-3xx { color: #58a6ff; }
    .status-4xx { color: #d29922; }
    .status-5xx { color: #f85149; font-weight: 600; }
    
    .action-btn {
      background: transparent;
      border: 1px solid rgba(240, 246, 252, 0.2);
      color: #8b949e;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .action-btn:hover { color: #f85149; border-color: #f85149; }

    /* PAGE BLOCKLIST STYLES */
    .ban-page-box {
      display: flex; gap: 8px; margin-bottom: 1rem;
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
      <button class="tab-btn active" onclick="switchTab('traffic', this)">📊 Grouped Requests</button>
      <button class="tab-btn" onclick="switchTab('feedback', this)">📌 Bug Reports (${stats.feedbacksCount})</button>
      <button class="tab-btn" onclick="switchTab('pages', this)">🚫 Blocked Pages (${stats.disabledPages.length})</button>
    </div>
  </header>

  <main>
    <!-- KILL SWITCH -->
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
        <button id="btn-kill" class="btn-toggle-kill ${stats.isPaused ? 'active-paused' : 'active-live'}" onclick="toggleKillSwitch()">
          ${stats.isPaused ? '▶ Resume Public Access' : '🛑 KILL SWITCH (Pause Access)'}
        </button>
      </div>
    </div>

    <!-- STATS -->
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

    <!-- TAB 1: GROUPED REQUESTS TREE -->
    <div class="panel" id="panel-traffic">
      <h2>📊 Grouped Page Requests (Click to view child assets & requests)</h2>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="table-traffic">
          ${stats.requestGroups
            .map(
              (group) => `
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
                <button class="action-btn" onclick="event.stopPropagation(); banPage('${group.url}')" title="Disable this page">🚫 Disable Page</button>
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
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- TAB 2: BUG REPORTS -->
    <div class="panel" id="panel-feedback" style="display: none;">
      <h2>📌 Client Sticky Notes & Bug Reports</h2>
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
              <button class="action-btn" onclick="toggleResolveFeedback('${f.id}')">
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
      <h2>🚫 Disabled Pages / Routes (Block specific pages only)</h2>
      <p style="color: #8b949e; font-size: 0.85rem; margin-bottom: 1rem;">
        Disabled pages return a 403 Forbidden screen to visitors, while the rest of your website remains active.
      </p>

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
            <button class="action-btn" onclick="unbanPage('${page}')" style="color:#3fb950; border-color:#3fb950;">✔ Re-enable Page</button>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  </main>

  <script>
    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-traffic').style.display = tab === 'traffic' ? 'block' : 'none';
      document.getElementById('panel-feedback').style.display = tab === 'feedback' ? 'block' : 'none';
      document.getElementById('panel-pages').style.display = tab === 'pages' ? 'block' : 'none';
    }

    function toggleGroup(id) {
      const rows = document.querySelectorAll('.child-of-' + id);
      const arrow = document.getElementById('arrow-' + id);
      const isCurrentlyOpen = arrow.classList.contains('open');

      if (isCurrentlyOpen) {
        arrow.classList.remove('open');
        rows.forEach(r => r.classList.remove('open'));
      } else {
        arrow.classList.add('open');
        rows.forEach(r => r.classList.add('open'));
      }
    }

    async function sendAdminAction(action, data = {}) {
      try {
        const res = await fetch('/__peer_admin_action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...data })
        });
        return await res.json();
      } catch (err) {
        alert('Action failed: ' + err.message);
      }
    }

    async function toggleKillSwitch() {
      const res = await sendAdminAction('toggle_pause');
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

    async function toggleResolveFeedback(id) {
      const res = await sendAdminAction('toggle_resolve_feedback', { id });
      if (res && res.success) updateUIState(res.stats);
    }

    function updateUIState(data) {
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

      // Update Disabled Pages List
      const pagesList = document.getElementById('disabled-pages-list');
      if (data.disabledPages.length === 0) {
        pagesList.innerHTML = '<p style="color: #8b949e;">No pages are currently disabled. All website routes are accessible.</p>';
      } else {
        pagesList.innerHTML = data.disabledPages.map(page => \`
          <div style="background: #0d1117; border: 1px solid rgba(240,246,252,0.1); padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace; color: #f85149; font-weight: 600;">🚫 \${page}</span>
            <button class="action-btn" onclick="unbanPage('\${page}')" style="color:#3fb950; border-color:#3fb950;">✔ Re-enable Page</button>
          </div>
        \`).join('');
      }
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
