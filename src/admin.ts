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

export interface RequestLogItem {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  ip: string;
  timestamp: number;
  headers: Record<string, string>;
  body?: string;
}

export class AdminTelemetry {
  public totalRequests = 0;
  public activeRequests = 0;
  public totalDuration = 0;
  public uniqueVisitors = new Set<string>();
  public requestLogs: RequestLogItem[] = [];
  public feedbacks: FeedbackItem[] = [];
  public isPaused = false;
  public bannedIps = new Set<string>();
  public simulatedDelayMs = 0;
  public currentPin?: string;
  public adminKey?: string;

  public statusCounts: Record<string, number> = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };

  constructor(initialPin?: string, adminKey?: string) {
    this.currentPin = initialPin;
    this.adminKey = adminKey;
  }

  public recordRequestStart(): void {
    this.totalRequests++;
    this.activeRequests++;
  }

  public recordRequestEnd(log: RequestLogItem): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.totalDuration += log.duration;
    this.uniqueVisitors.add(log.ip);

    const group = `${Math.floor(log.status / 100)}xx`;
    this.statusCounts[group] = (this.statusCounts[group] || 0) + 1;

    this.requestLogs.unshift(log);
    if (this.requestLogs.length > 100) {
      this.requestLogs.pop();
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

  public getStats() {
    const avgLatency = this.totalRequests > 0 ? Math.round(this.totalDuration / this.totalRequests) : 0;
    return {
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      uniqueVisitors: this.uniqueVisitors.size,
      avgLatency,
      isPaused: this.isPaused,
      bannedIps: Array.from(this.bannedIps),
      simulatedDelayMs: this.simulatedDelayMs,
      currentPin: this.currentPin || null,
      statusCounts: this.statusCounts,
      feedbacksCount: this.feedbacks.filter((f) => !f.resolved).length,
      recentRequests: this.requestLogs.slice(0, 35),
      feedbacks: this.feedbacks,
    };
  }

  public renderAdminDashboardHtml(adminKeyParam?: string): string {
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
      padding: 6px 12px;
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
    .kill-actions { display: flex; gap: 10px; }
    .btn-toggle-kill {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-toggle-kill.active-live {
      background: #da3633; color: #fff;
    }
    .btn-toggle-kill.active-live:hover { background: #f85149; }
    .btn-toggle-kill.active-paused {
      background: #238636; color: #fff;
    }
    .btn-toggle-kill.active-paused:hover { background: #2ea043; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; font-family: monospace; }
    th { text-align: left; padding: 8px 12px; border-bottom: 1px solid rgba(240, 246, 252, 0.1); color: #8b949e; }
    td { padding: 9px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .status-2xx { color: #3fb950; font-weight: 600; }
    .status-3xx { color: #58a6ff; }
    .status-4xx { color: #d29922; }
    .status-5xx { color: #f85149; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-get { background: rgba(63, 185, 80, 0.15); color: #3fb950; }
    .badge-post { background: rgba(88, 166, 255, 0.15); color: #58a6ff; }
    .badge-put { background: rgba(210, 153, 34, 0.15); color: #d29922; }
    .badge-delete { background: rgba(248, 81, 73, 0.15); color: #f85149; }
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

    /* CONTROLS GRID */
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }
    .control-box {
      background: #0d1117;
      border: 1px solid rgba(240, 246, 252, 0.1);
      border-radius: 8px;
      padding: 1rem;
    }
    .control-box label { font-size: 0.8rem; color: #8b949e; display: block; margin-bottom: 6px; font-weight: 600; }
    .control-box input, .control-box select {
      width: 100%;
      background: #161b22;
      border: 1px solid rgba(240, 246, 252, 0.2);
      border-radius: 6px;
      padding: 8px 12px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      margin-bottom: 8px;
    }
    .control-box button {
      background: #238636; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span>⚡ peer-port</span>
      <span style="font-size: 0.8rem; color: #8b949e; font-weight: normal;">Executive Admin Center</span>
      <div id="status-badge" class="status-pill ${stats.isPaused ? 'paused' : 'live'}">
        ${stats.isPaused ? '🔴 TUNNEL PAUSED' : '🟢 LIVE & STREAMING'}
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('traffic', this)">📊 Live Traffic</button>
      <button class="tab-btn" onclick="switchTab('feedback', this)">📌 Bug Reports (${stats.feedbacksCount})</button>
      <button class="tab-btn" onclick="switchTab('security', this)">🛡️ Access & Controls</button>
    </div>
  </header>

  <main>
    <!-- EMERGENCY KILL SWITCH BANNER -->
    <div class="kill-banner">
      <div class="kill-info">
        <h3 id="kill-title">${stats.isPaused ? '⚠️ Public Link is PAUSED' : '🟢 Public Link is ACTIVE'}</h3>
        <p id="kill-desc">${
          stats.isPaused
            ? 'Visitors are currently blocked with a 503 Maintenance screen. Your local app is completely private.'
            : 'Anyone with the link can access your website. Click the kill switch to instantly freeze external access.'
        }</p>
      </div>
      <div class="kill-actions">
        <button id="btn-kill" class="btn-toggle-kill ${stats.isPaused ? 'active-paused' : 'active-live'}" onclick="toggleKillSwitch()">
          ${stats.isPaused ? '▶ Resume Public Access' : '🛑 KILL SWITCH (Pause Access)'}
        </button>
      </div>
    </div>

    <!-- STATS METRICS -->
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
      <div class="stat-card">
        <div class="stat-title">PIN Status</div>
        <div class="stat-value" id="val-pin" style="font-size: 1.2rem; margin-top: 8px;">
          ${stats.currentPin ? '🔒 ' + stats.currentPin : '🔓 Open'}
        </div>
      </div>
    </div>

    <!-- TAB 1: TRAFFIC STREAM -->
    <div class="panel" id="panel-traffic">
      <h2>📊 Live Request Stream</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>URL Path</th>
            <th>Status</th>
            <th>Duration</th>
            <th>IP Address</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="table-traffic">
          ${stats.recentRequests
            .map(
              (r) => `
            <tr>
              <td><span class="badge badge-${r.method.toLowerCase()}">${r.method}</span></td>
              <td>${r.url}</td>
              <td class="status-${Math.floor(r.status / 100)}xx">${r.status}</td>
              <td>${r.duration}ms</td>
              <td>${r.ip}</td>
              <td>${new Date(r.timestamp).toLocaleTimeString()}</td>
              <td>
                <button class="action-btn" onclick="banIp('${r.ip}')" title="Ban this IP">🚫 Ban</button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- TAB 2: BUG REPORTS & STICKY NOTES -->
    <div class="panel" id="panel-feedback" style="display: none;">
      <h2>📌 Client Visual Sticky-Notes</h2>
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

    <!-- TAB 3: ADMIN ACCESS & SECURITY CONTROLS -->
    <div class="panel" id="panel-security" style="display: none;">
      <h2>🛡️ Admin Superpowers & Security Controls</h2>
      <div class="controls-grid">
        <!-- Dynamic PIN Update -->
        <div class="control-box">
          <label>Update Link PIN / Password</label>
          <input type="text" id="input-new-pin" placeholder="Enter new PIN (or leave empty to disable)" value="${
            stats.currentPin || ''
          }" />
          <button onclick="updatePin()">Apply PIN</button>
        </div>

        <!-- Simulated Latency / Chaos -->
        <div class="control-box">
          <label>Simulated Latency (Slow 3G/4G testing)</label>
          <select id="select-delay" onchange="updateDelay(this.value)">
            <option value="0" ${stats.simulatedDelayMs === 0 ? 'selected' : ''}>0ms (Normal full speed)</option>
            <option value="300" ${stats.simulatedDelayMs === 300 ? 'selected' : ''}>300ms (Fast 3G)</option>
            <option value="800" ${stats.simulatedDelayMs === 800 ? 'selected' : ''}>800ms (Slow 3G)</option>
            <option value="1500" ${stats.simulatedDelayMs === 1500 ? 'selected' : ''}>1500ms (High Latency / Edge)</option>
          </select>
        </div>

        <!-- Banned IPs -->
        <div class="control-box">
          <label>Banned IP Addresses (${stats.bannedIps.length})</label>
          <div id="banned-ips-list" style="max-height: 90px; overflow-y: auto; font-family: monospace; font-size: 0.8rem; margin-bottom: 8px;">
            ${
              stats.bannedIps.length === 0
                ? '<span style="color:#8b949e;">No IPs banned currently.</span>'
                : stats.bannedIps.map((ip) => `<div>${ip} <button class="action-btn" onclick="unbanIp('${ip}')">Unban</button></div>`).join('')
            }
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-traffic').style.display = tab === 'traffic' ? 'block' : 'none';
      document.getElementById('panel-feedback').style.display = tab === 'feedback' ? 'block' : 'none';
      document.getElementById('panel-security').style.display = tab === 'security' ? 'block' : 'none';
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
      if (res && res.success) {
        updateUIState(res.stats);
      }
    }

    async function banIp(ip) {
      if (!confirm('Are you sure you want to ban IP: ' + ip + '? They will be completely blocked.')) return;
      const res = await sendAdminAction('ban_ip', { ip });
      if (res && res.success) updateUIState(res.stats);
    }

    async function unbanIp(ip) {
      const res = await sendAdminAction('unban_ip', { ip });
      if (res && res.success) updateUIState(res.stats);
    }

    async function updatePin() {
      const pin = document.getElementById('input-new-pin').value.trim();
      const res = await sendAdminAction('set_pin', { pin });
      if (res && res.success) {
        alert(pin ? 'PIN updated to: ' + pin : 'PIN protection disabled!');
        updateUIState(res.stats);
      }
    }

    async function updateDelay(delay) {
      const res = await sendAdminAction('set_delay', { delay: parseInt(delay, 10) });
      if (res && res.success) updateUIState(res.stats);
    }

    async function toggleResolveFeedback(id) {
      const res = await sendAdminAction('toggle_resolve_feedback', { id });
      if (res && res.success) updateUIState(res.stats);
    }

    function updateUIState(data) {
      // Update Kill switch UI
      const badge = document.getElementById('status-badge');
      const killTitle = document.getElementById('kill-title');
      const killDesc = document.getElementById('kill-desc');
      const killBtn = document.getElementById('btn-kill');

      if (data.isPaused) {
        badge.className = 'status-pill paused';
        badge.textContent = '🔴 TUNNEL PAUSED';
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
      document.getElementById('val-pin').textContent = data.currentPin ? '🔒 ' + data.currentPin : '🔓 Open';

      // Update table
      const tbody = document.getElementById('table-traffic');
      tbody.innerHTML = data.recentRequests.map(r => \`
        <tr>
          <td><span class="badge badge-\${r.method.toLowerCase()}">\${r.method}</span></td>
          <td>\${r.url}</td>
          <td class="status-\${Math.floor(r.status / 100)}xx">\${r.status}</td>
          <td>\${r.duration}ms</td>
          <td>\${r.ip}</td>
          <td>\${new Date(r.timestamp).toLocaleTimeString()}</td>
          <td>
            <button class="action-btn" onclick="banIp('\${r.ip}')" title="Ban this IP">🚫 Ban</button>
          </td>
        </tr>
      \`).join('');

      // Update feedback
      const fbList = document.getElementById('feedback-list');
      if (data.feedbacks.length === 0) {
        fbList.innerHTML = '<p style="color: #8b949e;">No feedback submitted yet.</p>';
      } else {
        fbList.innerHTML = data.feedbacks.map(f => \`
          <div class="feedback-card \${f.resolved ? 'resolved' : ''}">
            <div class="feedback-header">
              <span>📍 Route: \${f.url}</span>
              <span>📱 Screen: \${f.screenSize} • \${new Date(f.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="feedback-body">💬 "\${f.comment}"</div>
            <div class="feedback-meta">🎯 Element: \${f.selector} \${f.elementText ? '("' + f.elementText + '")' : ''}</div>
            <div>
              <button class="action-btn" onclick="toggleResolveFeedback('\${f.id}')">
                \${f.resolved ? '↩ Re-open' : '✔ Mark Resolved'}
              </button>
            </div>
          </div>
        \`).join('');
      }

      // Update banned IPs list
      const bannedList = document.getElementById('banned-ips-list');
      if (data.bannedIps.length === 0) {
        bannedList.innerHTML = '<span style="color:#8b949e;">No IPs banned currently.</span>';
      } else {
        bannedList.innerHTML = data.bannedIps.map(ip => \`<div>\${ip} <button class="action-btn" onclick="unbanIp('\${ip}')">Unban</button></div>\`).join('');
      }
    }

    // Auto-refresh every 2 seconds
    setInterval(async () => {
      try {
        const res = await fetch('/__peer_admin_data');
        const data = await res.json();
        updateUIState(data);
      } catch (err) {}
    }, 2000);
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
