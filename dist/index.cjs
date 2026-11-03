"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  CHUNK_SIZE: () => CHUNK_SIZE,
  LocalHttpProxy: () => LocalHttpProxy,
  SignalingServer: () => SignalingServer,
  WebRtcBridge: () => WebRtcBridge,
  startGlobalTunnel: () => startGlobalTunnel,
  startPeerTunnel: () => startPeerTunnel,
  startTunnel: () => startTunnel
});
module.exports = __toCommonJS(src_exports);

// src/qrcode.ts
var import_qrcode_terminal = __toESM(require("qrcode-terminal"), 1);
function printQrCode(url) {
  import_qrcode_terminal.default.generate(url, { small: true });
}

// src/network.ts
var import_node_os = __toESM(require("os"), 1);
function getLocalIpAddress() {
  const interfaces = import_node_os.default.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

// src/guard.ts
var import_node_http = __toESM(require("http"), 1);
var import_node_process2 = __toESM(require("process"), 1);
var import_node_buffer = require("buffer");
var import_node_crypto = __toESM(require("crypto"), 1);

// src/admin.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_process = __toESM(require("process"), 1);
function loadEnv() {
  try {
    if (typeof import_node_process.default.loadEnvFile === "function") {
      import_node_process.default.loadEnvFile();
    }
  } catch (e) {
  }
  try {
    const envPath = import_node_path.default.resolve(import_node_process.default.cwd(), ".env");
    if (import_node_fs.default.existsSync(envPath)) {
      const content = import_node_fs.default.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...rest] = trimmed.split("=");
          const k = key.trim();
          if (k && !import_node_process.default.env[k]) {
            import_node_process.default.env[k] = rest.join("=").trim().replace(/^["']|["']$/g, "");
          }
        }
      }
    }
  } catch (e) {
  }
}
loadEnv();
var AdminTelemetry = class {
  publicUrl = "";
  targetHost = "localhost";
  targetPort = 3e3;
  startedAt = Date.now();
  totalRequests = 0;
  activeRequests = 0;
  totalDuration = 0;
  uniqueVisitors = /* @__PURE__ */ new Set();
  requestGroups = [];
  currentParentGroup = null;
  feedbacks = [];
  isPaused = false;
  // Master kill switch
  disabledPages = /* @__PURE__ */ new Set();
  // Route/Page blocklist
  adminPassword;
  remoteTunnels = /* @__PURE__ */ new Map();
  statusCounts = {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0
  };
  constructor(adminPassword) {
    loadEnv();
    this.adminPassword = adminPassword || import_node_process.default.env.ADMIN_PASSWORD || "admin_Ankit@1320";
  }
  setPublicUrl(url) {
    this.publicUrl = url;
  }
  registerRemoteTunnel(info, clientIp) {
    const tunnel = {
      id: info.id || "tun_" + Math.random().toString(36).substring(2, 9),
      publicUrl: info.publicUrl || "",
      target: info.target || "localhost:3000",
      clientIp: clientIp || "127.0.0.1",
      startedAt: info.startedAt || Date.now(),
      lastPing: Date.now(),
      totalRequests: info.totalRequests || 0,
      activeRequests: info.activeRequests || 0,
      uniqueVisitors: info.uniqueVisitors || 1,
      avgLatency: info.avgLatency || 0,
      isPaused: false,
      disabledPages: [],
      requestGroups: [],
      feedbacks: []
    };
    this.remoteTunnels.set(tunnel.id, tunnel);
    return tunnel;
  }
  updateRemoteTunnel(info) {
    const tunnel = this.remoteTunnels.get(info.id);
    if (!tunnel) return void 0;
    tunnel.lastPing = Date.now();
    if (info.publicUrl) tunnel.publicUrl = info.publicUrl;
    if (info.totalRequests !== void 0) tunnel.totalRequests = info.totalRequests;
    if (info.activeRequests !== void 0) tunnel.activeRequests = info.activeRequests;
    if (info.uniqueVisitors !== void 0) tunnel.uniqueVisitors = info.uniqueVisitors;
    if (info.avgLatency !== void 0) tunnel.avgLatency = info.avgLatency;
    if (info.requestGroups) tunnel.requestGroups = info.requestGroups;
    if (info.feedbacks) tunnel.feedbacks = info.feedbacks;
    return tunnel;
  }
  pruneInactiveTunnels() {
    const now = Date.now();
    for (const [id, t] of this.remoteTunnels.entries()) {
      if (now - t.lastPing > 15e3) {
        this.remoteTunnels.delete(id);
      }
    }
  }
  getAssetType(url, headers) {
    const path3 = url.split("?")[0].toLowerCase();
    if (path3.endsWith(".js") || path3.endsWith(".mjs")) return "script";
    if (path3.endsWith(".css")) return "style";
    if (path3.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return "image";
    if (path3.match(/\.(woff|woff2|ttf|eot)$/)) return "font";
    if (path3.startsWith("/api/") || headers["accept"]?.includes("application/json")) return "api";
    return "document";
  }
  recordRequestStart() {
    this.totalRequests++;
    this.activeRequests++;
  }
  recordRequestEnd(method, url, status, duration, ip, headers) {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.totalDuration += duration;
    this.uniqueVisitors.add(ip);
    const group = `${Math.floor(status / 100)}xx`;
    this.statusCounts[group] = (this.statusCounts[group] || 0) + 1;
    const assetType = this.getAssetType(url, headers);
    const subItem = {
      id: Math.random().toString(36).substring(2, 9),
      method,
      url,
      status,
      duration,
      type: assetType,
      timestamp: Date.now()
    };
    if (assetType === "document" || !this.currentParentGroup) {
      const parentGroup = {
        id: "req_" + Math.random().toString(36).substring(2, 9),
        method,
        url,
        status,
        duration,
        ip,
        timestamp: Date.now(),
        subRequests: [subItem]
      };
      this.currentParentGroup = parentGroup;
      this.requestGroups.unshift(parentGroup);
      if (this.requestGroups.length > 50) this.requestGroups.pop();
    } else {
      this.currentParentGroup.subRequests.push(subItem);
    }
  }
  addFeedback(item) {
    const feedback = {
      ...item,
      id: "fb_" + Math.random().toString(36).substring(2, 9),
      resolved: false
    };
    this.feedbacks.unshift(feedback);
    return feedback;
  }
  toggleDisablePage(route) {
    const cleanRoute = route.trim().toLowerCase();
    if (this.disabledPages.has(cleanRoute)) {
      this.disabledPages.delete(cleanRoute);
      return false;
    } else {
      this.disabledPages.add(cleanRoute);
      return true;
    }
  }
  isPageDisabled(urlPath) {
    const cleanPath = urlPath.split("?")[0].toLowerCase();
    for (const disabled of this.disabledPages) {
      if (cleanPath === disabled || cleanPath.startsWith(disabled + "/")) {
        return true;
      }
    }
    return false;
  }
  getStats() {
    this.pruneInactiveTunnels();
    const avgLatency = this.totalRequests > 0 ? Math.round(this.totalDuration / this.totalRequests) : 0;
    const effectiveUrl = this.publicUrl || `http://${this.targetHost}:${this.targetPort}`;
    const tunnelsList = [];
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
        feedbacks: t.feedbacks
      });
    }
    const isRender = Boolean(import_node_process.default.env.RENDER);
    if (!isRender && tunnelsList.length === 0 || this.publicUrl && !this.publicUrl.includes("onrender.com")) {
      tunnelsList.push({
        id: "local_tunnel",
        publicUrl: effectiveUrl,
        target: `http://${this.targetHost}:${this.targetPort}`,
        startedAt: this.startedAt,
        totalRequests: this.totalRequests,
        uniqueVisitors: this.uniqueVisitors.size,
        avgLatency,
        isPaused: this.isPaused,
        disabledPages: Array.from(this.disabledPages),
        requestGroups: this.requestGroups.slice(0, 50),
        feedbacks: this.feedbacks
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
      tunnels: tunnelsList
    };
  }
  renderAdminLoginHtml(error) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u{1F512} Admin Authentication \u2014 peer-port</title>
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
    <div class="icon">\u{1F6E1}\uFE0F</div>
    <h1>Admin Access</h1>
    <p>Enter your Admin Password to access the live controls.</p>
    ${error ? `<div class="error">${error}</div>` : ""}
    <form method="POST" action="/__peer_admin_login">
      <input type="password" name="password" placeholder="Admin Password" autofocus required />
      <button type="submit">Sign In to Dashboard</button>
    </form>
  </div>
</body>
</html>`;
  }
  renderAdminDashboardHtml() {
    const stats = this.getStats();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u26A1 peer-port \u2014 Executive Admin Center</title>
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
      <span>\u26A1 peer-port</span>
      <span style="font-size: 0.8rem; color: #8b949e; font-weight: normal;">Executive Admin Center</span>
      <div id="status-badge" class="status-pill ${stats.isPaused ? "paused" : "live"}">
        ${stats.isPaused ? "\u{1F534} ACCESS PAUSED" : "\u{1F7E2} LIVE & STREAMING"}
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('websites', this)">\u{1F310} Hosted Websites (${stats.tunnels.length})</button>
      <button class="tab-btn" onclick="switchTab('feedback', this)">\u{1F4CC} Bug Reports (${stats.feedbacksCount})</button>
      <button class="tab-btn" onclick="switchTab('pages', this)">\u{1F6AB} Blocked Pages (${stats.disabledPages.length})</button>
    </div>
  </header>

  <main>
    <!-- KILL SWITCH TOP BANNER -->
    <div class="kill-banner">
      <div class="kill-info">
        <h3 id="kill-title">${stats.isPaused ? "\u26A0\uFE0F Public Link is PAUSED" : "\u{1F7E2} Public Link is ACTIVE"}</h3>
        <p id="kill-desc">${stats.isPaused ? "Visitors are currently blocked with a 503 Maintenance screen. Your local app is completely private." : "Anyone with the link can access your website. Click the kill switch to instantly freeze external access."}</p>
      </div>
      <div>
        <button id="btn-kill" class="btn-toggle-kill ${stats.isPaused ? "active-paused" : "active-live"}" onclick="toggleKillSwitch('local_tunnel')">
          ${stats.isPaused ? "\u25B6 Resume Public Access" : "\u{1F6D1} KILL SWITCH (Pause Access)"}
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
        <h2>\u{1F310} Hosted Websites & Active Public Links</h2>
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
          ${stats.tunnels.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #8b949e; padding: 3rem 1rem;">\u26A1 No active developer tunnels connected.<br><span style="font-size: 0.85rem; color: #58a6ff; margin-top: 6px; display: inline-block;">Run <code>npx peer-port 3000</code> in your or your friend's terminal to share localhost and see it appear here live!</span></td></tr>` : stats.tunnels.map(
      (t) => `
            <tr class="website-row" id="row-${t.id}">
              <td>
                <a href="${t.publicUrl}" target="_blank" class="tunnel-link" id="site-link-${t.id}">
                  ${t.publicUrl} \u2197
                </a>
                <button class="btn-copy" onclick="copyText('${t.publicUrl}')" title="Copy public link">\u{1F4CB} Copy</button>
              </td>
              <td style="font-family: monospace; color: #8b949e;" id="site-target-${t.id}">
                ${t.target}
              </td>
              <td id="site-status-badge-${t.id}">
                ${t.isPaused ? '<span class="status-badge-paused">\u{1F534} PAUSED (503)</span>' : '<span class="status-badge-live">\u{1F7E2} LIVE & ONLINE</span>'}
              </td>
              <td id="site-activity-summary-${t.id}" style="color: #e6edf3; font-weight: 500;">
                ${t.totalRequests} reqs \u2022 ${t.uniqueVisitors} visitors \u2022 ${t.avgLatency}ms avg
              </td>
              <td>
                <div class="btn-actions-group">
                  <button class="btn-live-preview" onclick="openLivePreviewModal('${t.publicUrl}')" title="Live Preview Website">
                    \u{1F441}\uFE0F Live Preview
                  </button>
                  <button id="btn-row-kill-${t.id}" class="btn-row-kill ${t.isPaused ? "resume" : "kill"}" onclick="toggleKillSwitch('${t.id}')" title="Toggle Kill Switch">
                    ${t.isPaused ? "\u25B6 Resume" : "\u{1F6D1} Kill Switch"}
                  </button>
                  <button class="btn-see-requests" onclick="openRequestsModal('${t.id}')" title="Inspect child requests & statistics">
                    \u{1F4CA} See Requests & Statistics
                  </button>
                </div>
              </td>
            </tr>
          `
    ).join("")}
        </tbody>
      </table>
    </div>

    <!-- TAB 2: BUG REPORTS -->
    <div class="panel" id="panel-feedback" style="display: none;">
      <div class="panel-header">
        <h2>\u{1F4CC} Client Sticky Notes & Bug Reports</h2>
        <p>Interactive feedback submitted by clients using the floating "Drop Comment" badge on your website.</p>
      </div>
      <div id="feedback-list">
        ${stats.feedbacks.length === 0 ? '<p style="color: #8b949e;">No feedback submitted yet. Clients can click the floating "Drop Comment" badge on the website.</p>' : stats.feedbacks.map(
      (f) => `
          <div class="feedback-card ${f.resolved ? "resolved" : ""}">
            <div class="feedback-header">
              <span>\u{1F4CD} Route: ${f.url}</span>
              <span>\u{1F4F1} Screen: ${f.screenSize} \u2022 ${new Date(f.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="feedback-body">\u{1F4AC} "${escapeHtml(f.comment)}"</div>
            <div class="feedback-meta">\u{1F3AF} Element: ${escapeHtml(f.selector)} ${f.elementText ? `("${escapeHtml(f.elementText)}")` : ""}</div>
            <div>
              <button class="device-btn" onclick="toggleResolveFeedback('${f.id}')">
                ${f.resolved ? "\u21A9 Re-open" : "\u2714 Mark Resolved"}
              </button>
            </div>
          </div>
        `
    ).join("")}
      </div>
    </div>

    <!-- TAB 3: DISABLED PAGES BLOCKLIST -->
    <div class="panel" id="panel-pages" style="display: none;">
      <div class="panel-header">
        <h2>\u{1F6AB} Blocked Pages (Route-Level Security)</h2>
        <p>Disabled routes return a 403 Forbidden screen to visitors while the rest of your website remains fully accessible.</p>
      </div>

      <div class="ban-page-box">
        <input type="text" id="input-ban-route" placeholder="e.g. /checkout or /admin or /settings" />
        <button onclick="addBanRoute()">Disable This Page</button>
      </div>

      <div id="disabled-pages-list">
        ${stats.disabledPages.length === 0 ? '<p style="color: #8b949e;">No pages are currently disabled. All website routes are accessible.</p>' : stats.disabledPages.map(
      (page) => `
          <div style="background: #0d1117; border: 1px solid rgba(240,246,252,0.1); padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace; color: #f85149; font-weight: 600;">\u{1F6AB} ${page}</span>
            <button class="action-btn-unban" onclick="unbanPage('${page}')">\u2714 Re-enable Page</button>
          </div>
        `
    ).join("")}
      </div>
    </div>
  </main>

  <!-- MODAL 1: LIVE PREVIEW MODAL -->
  <div class="modal-backdrop" id="modal-preview" onclick="if(event.target === this) closeLivePreviewModal()">
    <div class="modal-container" style="max-width: 1000px;">
      <div class="modal-header">
        <h3>\u{1F441}\uFE0F Live Website Preview \u2014 <span id="preview-modal-url" style="color: #58a6ff; font-weight: normal; font-size: 0.95rem;">${stats.publicUrl}</span></h3>
        <button class="btn-close-modal" onclick="closeLivePreviewModal()">\u2715</button>
      </div>
      <div class="modal-body">
        <div class="preview-toolbar">
          <div class="device-buttons">
            <button class="device-btn active" id="btn-dev-desk" onclick="setPreviewDevice('desktop')">\u{1F5A5}\uFE0F Desktop (100%)</button>
            <button class="device-btn" id="btn-dev-tab" onclick="setPreviewDevice('tablet')">\u{1F4BB} Tablet (768px)</button>
            <button class="device-btn" id="btn-dev-mob" onclick="setPreviewDevice('mobile')">\u{1F4F1} Mobile (375px)</button>
          </div>
          <div>
            <a id="preview-new-tab" href="/" target="_blank" style="color: #58a6ff; font-size: 0.82rem; text-decoration: none; font-weight: 600;">Open in New Tab \u2197</a>
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
        <h3>\u{1F4CA} Requests & Performance Analytics \u2014 <span id="req-modal-url" style="color: #58a6ff; font-weight: normal; font-size: 0.95rem;">${stats.publicUrl}</span></h3>
        <button class="btn-close-modal" onclick="closeRequestsModal()">\u2715</button>
      </div>
      <div class="modal-body">
        <!-- Quick stats bar inside modal -->
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">2xx Success</div>
            <div class="stat-value" id="modal-val-2xx" style="color: #3fb950; font-size: 1.3rem;">${stats.statusCounts["2xx"] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">3xx Redirects</div>
            <div class="stat-value" id="modal-val-3xx" style="color: #58a6ff; font-size: 1.3rem;">${stats.statusCounts["3xx"] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">4xx Client Errors</div>
            <div class="stat-value" id="modal-val-4xx" style="color: #d29922; font-size: 1.3rem;">${stats.statusCounts["4xx"] || 0}</div>
          </div>
          <div class="stat-card" style="padding: 0.8rem 1rem;">
            <div class="stat-title">5xx Server Errors</div>
            <div class="stat-value" id="modal-val-5xx" style="color: #f85149; font-size: 1.3rem;">${stats.statusCounts["5xx"] || 0}</div>
          </div>
        </div>

        <!-- Disable Page Tool inside modal -->
        <div style="background: rgba(22, 27, 34, 0.6); border: 1px solid rgba(240,246,252,0.1); border-radius: 8px; padding: 12px 14px;">
          <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">\u{1F6AB} Disable Page Control</div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="modal-input-ban" placeholder="Enter route e.g. /checkout or /about" style="flex: 1; max-width: 320px; background: #0d1117; border: 1px solid rgba(240,246,252,0.2); border-radius: 6px; padding: 6px 10px; color: #fff; font-size: 0.85rem;" />
            <button onclick="modalAddBanRoute()" style="background: #da3633; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">\u{1F6AB} Disable Page</button>
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
              ${stats.requestGroups.map((group) => {
      const isBanned = stats.disabledPages.includes(group.url.toLowerCase());
      return `
                <tr class="parent-row" onclick="toggleGroup('${group.id}')">
                  <td><span class="expand-arrow" id="arrow-${group.id}">\u25B6</span></td>
                  <td><span class="badge badge-${group.method.toLowerCase()}">${group.method}</span></td>
                  <td style="color: #fff;">${group.url}</td>
                  <td class="status-${Math.floor(group.status / 100)}xx">${group.status}</td>
                  <td>${group.duration}ms</td>
                  <td style="color: #58a6ff;">${group.subRequests.length} sub-assets</td>
                  <td>${group.ip}</td>
                  <td>${new Date(group.timestamp).toLocaleTimeString()}</td>
                  <td>
                    ${isBanned ? `<button class="action-btn-unban" onclick="event.stopPropagation(); unbanPage('${group.url}')" title="Re-enable page">\u2705 Enable Page</button>` : `<button class="action-btn-ban" onclick="event.stopPropagation(); banPage('${group.url}')" title="Disable this page">\u{1F6AB} Disable Page</button>`}
                  </td>
                </tr>
                ${group.subRequests.map(
        (sub) => `
                  <tr class="child-row child-of-${group.id}">
                    <td></td>
                    <td><span style="font-size: 0.7rem; color: #8b949e;">${sub.method}</span></td>
                    <td>\u21B3 ${sub.url} <span style="font-size: 0.7rem; color: #58a6ff;">(${sub.type})</span></td>
                    <td class="status-${Math.floor(sub.status / 100)}xx">${sub.status}</td>
                    <td>${sub.duration}ms</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${new Date(sub.timestamp).toLocaleTimeString()}</td>
                    <td></td>
                  </tr>
                `
      ).join("")}
              `;
    }).join("")}
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
            <td><span class="expand-arrow" id="arrow-\${group.id}">\u25B6</span></td>
            <td><span class="badge badge-\${group.method.toLowerCase()}">\${group.method}</span></td>
            <td style="color: #fff;">\${group.url}</td>
            <td class="status-\${Math.floor(group.status / 100)}xx">\${group.status}</td>
            <td>\${group.duration}ms</td>
            <td style="color: #58a6ff;">\${group.subRequests.length} sub-assets</td>
            <td>\${group.ip}</td>
            <td>\${new Date(group.timestamp).toLocaleTimeString()}</td>
            <td>
              \${isBanned 
                ? \`<button class="action-btn-unban" onclick="event.stopPropagation(); unbanPage('\${group.url}')">\u2705 Enable Page</button>\`
                : \`<button class="action-btn-ban" onclick="event.stopPropagation(); banPage('\${group.url}')">\u{1F6AB} Disable Page</button>\`
              }
            </td>
          </tr>
          \${group.subRequests.map(sub => \`
            <tr class="child-row child-of-\${group.id}">
              <td></td>
              <td><span style="font-size: 0.7rem; color: #8b949e;">\${sub.method}</span></td>
              <td>\u21B3 \${sub.url} <span style="font-size: 0.7rem; color: #58a6ff;">(\${sub.type})</span></td>
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
        badge.textContent = '\u{1F534} ACCESS PAUSED';
        killTitle.textContent = '\u26A0\uFE0F Public Link is PAUSED';
        killDesc.textContent = 'Visitors are currently blocked with a 503 Maintenance screen. Your local app is completely private.';
        killBtn.className = 'btn-toggle-kill active-paused';
        killBtn.textContent = '\u25B6 Resume Public Access';
      } else {
        badge.className = 'status-pill live';
        badge.textContent = '\u{1F7E2} LIVE & STREAMING';
        killTitle.textContent = '\u{1F7E2} Public Link is ACTIVE';
        killDesc.textContent = 'Anyone with the link can access your website. Click the kill switch to instantly freeze external access.';
        killBtn.className = 'btn-toggle-kill active-live';
        killBtn.textContent = '\u{1F6D1} KILL SWITCH (Pause Access)';
      }

      document.getElementById('val-active').textContent = data.activeRequests;
      document.getElementById('val-total').textContent = data.totalRequests;
      document.getElementById('val-visitors').textContent = data.uniqueVisitors;
      document.getElementById('val-latency').textContent = data.avgLatency + ' ms';

      // Update Tunnels Table
      const tableBody = document.getElementById('table-websites');
      if (tableBody && data.tunnels) {
        if (data.tunnels.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #8b949e; padding: 3rem 1rem;">\u26A1 No active developer tunnels connected.<br><span style="font-size: 0.85rem; color: #58a6ff; margin-top: 6px; display: inline-block;">Run <code>npx peer-port 3000</code> in your or your friend\\'s terminal to share localhost and see it appear here live!</span></td></tr>';
        } else {
          tableBody.innerHTML = data.tunnels.map(t => \`
            <tr class="website-row" id="row-\${t.id}">
              <td>
                <a href="\${t.publicUrl}" target="_blank" class="tunnel-link" id="site-link-\${t.id}">
                  \${t.publicUrl} \u2197
                </a>
                <button class="btn-copy" onclick="copyText('\${t.publicUrl}')" title="Copy public link">\u{1F4CB} Copy</button>
              </td>
              <td style="font-family: monospace; color: #8b949e;" id="site-target-\${t.id}">
                \${t.target}
              </td>
              <td id="site-status-badge-\${t.id}">
                \${t.isPaused ? '<span class="status-badge-paused">\u{1F534} PAUSED (503)</span>' : '<span class="status-badge-live">\u{1F7E2} LIVE & ONLINE</span>'}
              </td>
              <td id="site-activity-summary-\${t.id}" style="color: #e6edf3; font-weight: 500;">
                \${t.totalRequests} reqs \u2022 \${t.uniqueVisitors} visitors \u2022 \${t.avgLatency}ms avg
              </td>
              <td>
                <div class="btn-actions-group">
                  <button class="btn-live-preview" onclick="openLivePreviewModal('\${t.publicUrl}')" title="Live Preview Website">
                    \u{1F441}\uFE0F Live Preview
                  </button>
                  <button id="btn-row-kill-\${t.id}" class="btn-row-kill \${t.isPaused ? 'resume' : 'kill'}" onclick="toggleKillSwitch('\${t.id}')" title="Toggle Kill Switch">
                    \${t.isPaused ? '\u25B6 Resume' : '\u{1F6D1} Kill Switch'}
                  </button>
                  <button class="btn-see-requests" onclick="openRequestsModal('\${t.id}')" title="Inspect child requests & statistics">
                    \u{1F4CA} See Requests & Statistics
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
};
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return m;
    }
  });
}

// src/widget.ts
var FEEDBACK_WIDGET_SCRIPT = `
<!-- __peer_port_feedback_widget__ -->
<style>
  #__pf_badge {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    background: #0d1117;
    color: #e6edf3;
    border: 1px solid rgba(88, 166, 255, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(88, 166, 255, 0.2);
    border-radius: 9999px;
    padding: 10px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
  }
  #__pf_badge:hover {
    transform: translateY(-2px);
    background: #161b22;
    border-color: #58a6ff;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(88, 166, 255, 0.4);
  }
  #__pf_badge.active {
    background: #238636;
    border-color: #3fb950;
    color: #ffffff;
  }
  .__pf_highlight {
    outline: 2px dashed #58a6ff !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
  }
  #__pf_modal_overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 2147483647;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  #__pf_modal {
    background: #161b22;
    color: #e6edf3;
    border: 1px solid rgba(240, 246, 252, 0.15);
    border-radius: 14px;
    padding: 22px;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7);
  }
  #__pf_modal h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  #__pf_modal .meta {
    font-size: 11px;
    color: #8b949e;
    background: #0d1117;
    padding: 6px 10px;
    border-radius: 6px;
    margin-bottom: 14px;
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #__pf_modal textarea {
    width: 100%;
    box-sizing: border-box;
    background: #0d1117;
    border: 1px solid rgba(240, 246, 252, 0.2);
    border-radius: 8px;
    color: #fff;
    padding: 10px;
    font-size: 14px;
    resize: vertical;
    min-height: 80px;
    outline: none;
    margin-bottom: 14px;
  }
  #__pf_modal textarea:focus {
    border-color: #58a6ff;
  }
  #__pf_modal .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  #__pf_modal button {
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  #__pf_modal .cancel-btn {
    background: transparent;
    color: #8b949e;
  }
  #__pf_modal .cancel-btn:hover { color: #fff; }
  #__pf_modal .submit-btn {
    background: #238636;
    color: #fff;
  }
  #__pf_modal .submit-btn:hover { background: #2ea043; }
</style>

<div id="__pf_badge" title="Click on any element to leave feedback">
  <span>\u{1F4CC}</span>
  <span id="__pf_badge_text">Drop Comment</span>
</div>

<div id="__pf_modal_overlay">
  <div id="__pf_modal">
    <h3>\u{1F4CC} Add Sticky Note</h3>
    <div class="meta" id="__pf_meta_selector">Selected: &lt;body&gt;</div>
    <textarea id="__pf_comment_input" placeholder="e.g. Change this button to dark blue, text is overlapping on my phone..."></textarea>
    <div class="actions">
      <button class="cancel-btn" id="__pf_cancel_btn">Cancel</button>
      <button class="submit-btn" id="__pf_submit_btn">Send to Developer</button>
    </div>
  </div>
</div>

<script>
(function() {
  let inspecting = false;
  let hoveredEl = null;
  let selectedTarget = null;

  const badge = document.getElementById('__pf_badge');
  const badgeText = document.getElementById('__pf_badge_text');
  const overlay = document.getElementById('__pf_modal_overlay');
  const metaText = document.getElementById('__pf_meta_selector');
  const commentInput = document.getElementById('__pf_comment_input');
  const cancelBtn = document.getElementById('__pf_cancel_btn');
  const submitBtn = document.getElementById('__pf_submit_btn');

  function getSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id) return '#' + el.id;
    let name = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\\s+/)[0];
      if (cls && !cls.startsWith('__pf')) name += '.' + cls;
    }
    return name;
  }

  function toggleInspect() {
    inspecting = !inspecting;
    if (inspecting) {
      badge.classList.add('active');
      badgeText.textContent = 'Click on any element...';
      document.body.style.cursor = 'crosshair';
    } else {
      badge.classList.remove('active');
      badgeText.textContent = 'Drop Comment';
      document.body.style.cursor = '';
      if (hoveredEl) {
        hoveredEl.classList.remove('__pf_highlight');
        hoveredEl = null;
      }
    }
  }

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInspect();
  });

  document.addEventListener('mouseover', (e) => {
    if (!inspecting) return;
    if (e.target.closest('#__pf_badge') || e.target.closest('#__pf_modal_overlay')) return;
    if (hoveredEl && hoveredEl !== e.target) {
      hoveredEl.classList.remove('__pf_highlight');
    }
    hoveredEl = e.target;
    hoveredEl.classList.add('__pf_highlight');
  }, true);

  document.addEventListener('click', (e) => {
    if (!inspecting) return;
    if (e.target.closest('#__pf_badge') || e.target.closest('#__pf_modal_overlay')) return;

    e.preventDefault();
    e.stopPropagation();

    selectedTarget = e.target;
    const selector = getSelector(selectedTarget);
    const textPreview = (selectedTarget.innerText || '').trim().substring(0, 35);

    metaText.textContent = selector + (textPreview ? ' ("' + textPreview + '")' : '');
    overlay.style.display = 'flex';
    commentInput.value = '';
    commentInput.focus();

    toggleInspect();
  }, true);

  cancelBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  submitBtn.addEventListener('click', async () => {
    const comment = commentInput.value.trim();
    if (!comment) return;

    const payload = {
      comment: comment,
      selector: getSelector(selectedTarget),
      elementText: (selectedTarget ? selectedTarget.innerText : '').trim().substring(0, 80),
      url: window.location.pathname + window.location.search,
      screenSize: window.innerWidth + 'x' + window.innerHeight,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    submitBtn.textContent = 'Sending...';
    try {
      await fetch('/__peer_feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      badgeText.textContent = '\u2714 Sent!';
      setTimeout(() => { badgeText.textContent = 'Drop Comment'; }, 2500);
    } catch (err) {
      alert('Failed to send feedback: ' + err.message);
    }

    overlay.style.display = 'none';
    submitBtn.textContent = 'Send to Developer';
  });
})();
</script>
`;

// src/guard.ts
var import_picocolors = __toESM(require("picocolors"), 1);
var PinGuardProxy = class {
  targetPort;
  targetHost;
  pin;
  authToken;
  adminAuthToken;
  enableFeedback;
  telemetry;
  server;
  port = 0;
  constructor(options) {
    this.targetPort = options.targetPort;
    this.targetHost = options.targetHost || "localhost";
    this.pin = options.pin ? String(options.pin).trim() : void 0;
    this.enableFeedback = options.enableFeedback !== false;
    this.telemetry = new AdminTelemetry(options.adminPassword);
    this.telemetry.targetHost = this.targetHost;
    this.telemetry.targetPort = this.targetPort;
    this.authToken = import_node_crypto.default.randomBytes(24).toString("hex");
    this.adminAuthToken = import_node_crypto.default.randomBytes(24).toString("hex");
    this.server = import_node_http.default.createServer((req, res) => this.handleRequest(req, res));
    this.setupWebSocketUpgrade();
  }
  isVisitorAuthorized(req) {
    if (!this.pin) return true;
    const cookies = req.headers.cookie || "";
    return cookies.includes(`peer_port_auth=${this.authToken}`);
  }
  isAdminAuthorized(req) {
    const cookies = req.headers.cookie || "";
    return cookies.includes(`peer_admin_auth=${this.adminAuthToken}`);
  }
  handleRequest(req, res) {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    if (!this.telemetry.publicUrl) {
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const proto = req.headers["x-forwarded-proto"] || "http";
      if (host) {
        this.telemetry.publicUrl = `${proto}://${host}`;
      }
    }
    const isRenderHub = Boolean(import_node_process2.default.env.RENDER || req.headers.host?.includes("onrender.com"));
    if (isRenderHub && !url.pathname.startsWith("/__peer_")) {
      res.writeHead(302, { Location: "/__peer_admin" });
      res.end();
      return;
    }
    if (url.pathname === "/__peer_hub_register" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const tunnel = this.telemetry.registerRemoteTunnel(data, clientIp);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, isPaused: tunnel.isPaused, disabledPages: tunnel.disabledPages }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (url.pathname === "/__peer_hub_heartbeat" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          let tunnel = this.telemetry.updateRemoteTunnel(data);
          if (!tunnel) {
            tunnel = this.telemetry.registerRemoteTunnel(data, clientIp);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, isPaused: tunnel.isPaused, disabledPages: tunnel.disabledPages }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (url.pathname === "/__peer_hub_disconnect" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (data && data.id) {
            this.telemetry.remoteTunnels.delete(data.id);
          }
        } catch {
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }
    if (url.pathname === "/__peer_admin_login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        const params = new URLSearchParams(body);
        const enteredPassword = (params.get("password") || "").trim();
        if (enteredPassword && enteredPassword === this.telemetry.adminPassword.trim()) {
          res.writeHead(302, {
            "Set-Cookie": `peer_admin_auth=${this.adminAuthToken}; Path=/; HttpOnly; SameSite=Lax`,
            Location: "/__peer_admin"
          });
          res.end();
        } else {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(this.telemetry.renderAdminLoginHtml("Incorrect Admin Password"));
        }
      });
      return;
    }
    if (url.pathname === "/__peer_admin") {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(this.telemetry.renderAdminLoginHtml());
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(this.telemetry.renderAdminDashboardHtml());
      return;
    }
    if (url.pathname === "/__peer_admin_data") {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(this.telemetry.getStats()));
      return;
    }
    if (url.pathname === "/__peer_admin_action" && req.method === "POST") {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const payload = JSON.parse(body);
          this.handleAdminAction(payload);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, stats: this.telemetry.getStats() }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (this.telemetry.isPaused) {
      res.writeHead(503, { "Content-Type": "text/html; charset=utf-8" });
      res.end(this.renderPausedScreen());
      return;
    }
    if (this.telemetry.isPageDisabled(url.pathname)) {
      res.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>403 Page Disabled</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem;text-align:center;}h1{color:#f85149;}</style></head><body><h1>\u{1F6AB} 403 Page Disabled</h1><p>The page <code>${escapeHtml2(url.pathname)}</code> has been disabled by the administrator.</p><a href="/" style="color:#58a6ff;">\u2190 Return to Home</a></body></html>`);
      return;
    }
    if (url.pathname === "/__peer_feedback" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const feedback = this.telemetry.addFeedback({
            comment: data.comment || "",
            selector: data.selector || "body",
            elementText: data.elementText || "",
            url: data.url || "/",
            screenSize: data.screenSize || "unknown",
            userAgent: data.userAgent || "",
            timestamp: Date.now()
          });
          this.logFeedbackToTerminal(feedback);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, id: feedback.id }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (url.pathname === "/__peer_auth" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        const params = new URLSearchParams(body);
        const enteredPin = (params.get("pin") || "").trim();
        const returnUrl = params.get("returnUrl") || "/";
        if (this.pin && enteredPin === this.pin) {
          res.writeHead(302, {
            "Set-Cookie": `peer_port_auth=${this.authToken}; Path=/; HttpOnly; SameSite=Lax`,
            Location: returnUrl
          });
          res.end();
        } else {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(this.renderLockscreen(returnUrl, "Incorrect PIN. Please try again."));
        }
      });
      return;
    }
    if (!this.isVisitorAuthorized(req)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(this.renderLockscreen(url.pathname + url.search));
      return;
    }
    this.forwardToTarget(req, res, clientIp);
  }
  handleAdminAction(payload) {
    const { action, tunnelId } = payload;
    if (tunnelId && tunnelId !== "local_tunnel") {
      const remote = this.telemetry.remoteTunnels.get(tunnelId);
      if (remote) {
        if (action === "toggle_pause") {
          remote.isPaused = !remote.isPaused;
        } else if (action === "toggle_disable_page" && payload.route) {
          const route = payload.route.trim().toLowerCase();
          const idx = remote.disabledPages.indexOf(route);
          if (idx >= 0) remote.disabledPages.splice(idx, 1);
          else remote.disabledPages.push(route);
        }
        return;
      }
    }
    switch (action) {
      case "toggle_pause":
        this.telemetry.isPaused = !this.telemetry.isPaused;
        console.log(
          this.telemetry.isPaused ? import_picocolors.default.bold(import_picocolors.default.red("\n  \u{1F6D1} [KILL SWITCH ACTIVATED] Public tunnel access is now PAUSED!")) : import_picocolors.default.bold(import_picocolors.default.green("\n  \u25B6 [KILL SWITCH DEACTIVATED] Public tunnel access has RESUMED!"))
        );
        break;
      case "toggle_disable_page":
        if (payload.route) {
          const isBanned = this.telemetry.toggleDisablePage(payload.route);
          console.log(
            isBanned ? import_picocolors.default.red(`  \u{1F6AB} [PAGE DISABLED] Blocked route: ${payload.route}`) : import_picocolors.default.green(`  \u2714 [PAGE RE-ENABLED] Restored route: ${payload.route}`)
          );
        }
        break;
      case "toggle_resolve_feedback":
        const fb = this.telemetry.feedbacks.find((f) => f.id === payload.id);
        if (fb) fb.resolved = !fb.resolved;
        break;
    }
  }
  forwardToTarget(req, res, clientIp) {
    const startTime = Date.now();
    this.telemetry.recordRequestStart();
    const headers = { ...req.headers };
    headers["host"] = `${this.targetHost}:${this.targetPort}`;
    delete headers["accept-encoding"];
    const options = {
      hostname: this.targetHost,
      port: this.targetPort,
      path: req.url,
      method: req.method,
      headers
    };
    const proxyReq = import_node_http.default.request(options, (proxyRes) => {
      const contentType = proxyRes.headers["content-type"] || "";
      const isHtml = typeof contentType === "string" && contentType.includes("text/html");
      if (this.enableFeedback && isHtml) {
        const chunks = [];
        proxyRes.on("data", (chunk) => chunks.push(chunk));
        proxyRes.on("end", () => {
          let html = import_node_buffer.Buffer.concat(chunks).toString("utf-8");
          if (html.includes("</body>")) {
            html = html.replace("</body>", `${FEEDBACK_WIDGET_SCRIPT}</body>`);
          } else if (html.includes("</html>")) {
            html = html.replace("</html>", `${FEEDBACK_WIDGET_SCRIPT}</html>`);
          } else {
            html += FEEDBACK_WIDGET_SCRIPT;
          }
          const modifiedBuffer = import_node_buffer.Buffer.from(html, "utf-8");
          const resHeaders = { ...proxyRes.headers };
          delete resHeaders["transfer-encoding"];
          resHeaders["content-length"] = String(modifiedBuffer.length);
          res.writeHead(proxyRes.statusCode || 200, resHeaders);
          res.end(modifiedBuffer);
          this.finishRequest(req.method || "GET", req.url || "/", proxyRes.statusCode || 200, startTime, clientIp, req.headers);
        });
      } else {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
        proxyRes.on("end", () => {
          this.finishRequest(req.method || "GET", req.url || "/", proxyRes.statusCode || 200, startTime, clientIp, req.headers);
        });
      }
    });
    proxyReq.on("error", () => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>peer-port Tunnel</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem 1.5rem;text-align:center;}.card{max-width:480px;margin:0 auto;background:#161b22;padding:2rem;border-radius:12px;border:1px solid rgba(240,246,252,0.1);}</style></head><body><div class="card"><h1>\u26A1 peer-port Tunnel</h1><p style="color:#8b949e;margin-top:8px;">Tunnel is online and waiting for local app traffic.</p></div></body></html>`);
      this.finishRequest(req.method || "GET", req.url || "/", 200, startTime, clientIp, req.headers);
    });
    req.pipe(proxyReq);
  }
  finishRequest(method, url, status, startTime, ip, headers) {
    const duration = Date.now() - startTime;
    this.telemetry.recordRequestEnd(method, url, status, duration, ip, headers);
  }
  logFeedbackToTerminal(f) {
    console.log("\n" + import_picocolors.default.bold(import_picocolors.default.bgMagenta(import_picocolors.default.white(" \u{1F4CC} NEW VISUAL FEEDBACK "))) + " on " + import_picocolors.default.cyan(f.url));
    console.log(`  \u{1F4AC} ${import_picocolors.default.bold(import_picocolors.default.green(`"${f.comment}"`))}`);
    console.log(`  \u{1F3AF} Element: ${import_picocolors.default.yellow(f.selector)} ${f.elementText ? import_picocolors.default.dim(`("${f.elementText}")`) : ""}`);
    console.log(`  \u{1F4F1} Device:  ${import_picocolors.default.white(f.screenSize)}  \u2022  ${import_picocolors.default.dim(new Date(f.timestamp).toLocaleTimeString())}
`);
  }
  setupWebSocketUpgrade() {
    this.server.on("upgrade", (req, socket, head) => {
      if (!this.isVisitorAuthorized(req) || this.telemetry.isPaused) {
        socket.destroy();
        return;
      }
      const proxyReq = import_node_http.default.request({
        hostname: this.targetHost,
        port: this.targetPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `${this.targetHost}:${this.targetPort}`
        }
      });
      proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
        socket.write(
          `HTTP/1.1 101 Switching Protocols\r
` + Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") + "\r\n\r\n"
        );
        if (proxyHead && proxyHead.length) socket.write(proxyHead);
        if (head && head.length) proxySocket.write(head);
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });
      proxyReq.on("error", () => {
        socket.destroy();
      });
      proxyReq.end();
    });
  }
  renderPausedScreen() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u23F8\uFE0F Tunnel Paused \u2014 peer-port</title>
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
    <div style="font-size: 3rem;">\u23F8\uFE0F</div>
    <h1>Tunnel Temporarily Paused</h1>
    <p>The host administrator has enabled the Kill Switch. Public access to this development server is currently suspended.</p>
  </div>
</body>
</html>`;
  }
  renderLockscreen(returnUrl, error) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u{1F512} Protected Tunnel \u2014 peer-port</title>
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
    <div class="lock-icon">\u{1F512}</div>
    <h1>Access Protected</h1>
    <p>This development tunnel requires a PIN to access.</p>
    ${error ? `<div class="error-msg">${error}</div>` : ""}
    <form method="POST" action="/__peer_auth">
      <input type="hidden" name="returnUrl" value="${escapeHtml2(returnUrl)}" />
      <input type="password" name="pin" class="input-box" placeholder="\u2022\u2022\u2022\u2022" autofocus required />
      <button type="submit" class="btn">Unlock & Enter</button>
    </form>
  </div>
</body>
</html>`;
  }
  async start(requestedPort) {
    const portToUse = requestedPort || (import_node_process2.default.env.PORT ? parseInt(import_node_process2.default.env.PORT, 10) : 0);
    return new Promise((resolve, reject) => {
      this.server.listen(portToUse, "0.0.0.0", () => {
        const addr = this.server.address();
        if (typeof addr === "object" && addr) {
          this.port = addr.port;
          resolve(this.port);
        } else {
          reject(new Error("Failed to obtain server address."));
        }
      });
    });
  }
  close() {
    this.server.close();
  }
};
function escapeHtml2(str) {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return m;
    }
  });
}

// src/tunnel.ts
var import_picocolors2 = __toESM(require("picocolors"), 1);
async function startGlobalTunnel(options) {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || "localhost";
  const lanIp = getLocalIpAddress();
  const lanUrl = `http://${lanIp}:${targetPort}`;
  console.log("\n" + import_picocolors2.default.bold(import_picocolors2.default.cyan("\u26A1 peer-port \u2014 Instant Global Public Tunnel & QA Suite")) + "\n");
  console.log(`  \u{1F3AF} Local App:        ${import_picocolors2.default.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  \u{1F4F6} Local LAN:        ${import_picocolors2.default.dim(lanUrl)}`);
  const pinGuard = new PinGuardProxy({
    targetPort,
    targetHost,
    pin: options.pin,
    adminPassword: options.adminPassword,
    enableFeedback: options.enableFeedback !== false
  });
  const tunnelPort = await pinGuard.start();
  if (options.pin) {
    console.log(`  \u{1F512} Visitor PIN:      ${import_picocolors2.default.bold(import_picocolors2.default.magenta(`ACTIVE (PIN: ${options.pin})`))}`);
  }
  const feedbackStatus = options.enableFeedback !== false ? import_picocolors2.default.green("ENABLED (Floating badge)") : import_picocolors2.default.dim("Disabled");
  console.log(`  \u{1F4CC} Visual Feedback:  ${feedbackStatus}`);
  console.log(import_picocolors2.default.yellow("  \u23F3 Generating secure public HTTPS link across the global internet..."));
  const { startTunnel: startTunnel2 } = await import("untun");
  const tunnel = await startTunnel2({
    port: tunnelPort,
    hostname: "localhost",
    acceptCloudflareNotice: true
  });
  if (!tunnel) {
    pinGuard.close();
    throw new Error("Failed to initialize Cloudflare tunnel process.");
  }
  const publicUrl = await tunnel.getURL();
  pinGuard.telemetry.setPublicUrl(publicUrl);
  const localAdminUrl = `http://localhost:${tunnelPort}/__peer_admin`;
  const DEFAULT_HUB_URL = "https://tunneler-admin.onrender.com";
  const hubUrl = (process.env.HUB_URL || DEFAULT_HUB_URL).replace(/\/$/, "");
  const isRender = Boolean(process.env.RENDER);
  let heartbeatInterval = null;
  const tunnelSessionId = "tun_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
  if (!isRender && hubUrl) {
    const registerPayload = {
      id: tunnelSessionId,
      publicUrl,
      target: `http://${targetHost}:${targetPort}`,
      startedAt: Date.now()
    };
    fetch(`${hubUrl}/__peer_hub_register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerPayload)
    }).catch(() => {
    });
    heartbeatInterval = setInterval(async () => {
      try {
        const stats = pinGuard.telemetry.getStats();
        const payload = {
          id: tunnelSessionId,
          publicUrl,
          target: `http://${targetHost}:${targetPort}`,
          startedAt: pinGuard.telemetry.startedAt,
          totalRequests: stats.totalRequests,
          activeRequests: stats.activeRequests,
          uniqueVisitors: stats.uniqueVisitors,
          avgLatency: stats.avgLatency,
          requestGroups: stats.requestGroups,
          feedbacks: stats.feedbacks
        };
        const res = await fetch(`${hubUrl}/__peer_hub_heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.isPaused === "boolean") {
            pinGuard.telemetry.isPaused = data.isPaused;
          }
          if (Array.isArray(data.disabledPages)) {
            pinGuard.telemetry.disabledPages = new Set(data.disabledPages);
          }
        }
      } catch {
      }
    }, 3e3);
    if (typeof heartbeatInterval.unref === "function") {
      heartbeatInterval.unref();
    }
  }
  console.log(`
  \u{1F310} ${import_picocolors2.default.bold(import_picocolors2.default.green("Public Website Link:"))} ${import_picocolors2.default.underline(import_picocolors2.default.bold(import_picocolors2.default.cyan(publicUrl)))}
`);
  if (!options.noQr) {
    console.log(import_picocolors2.default.dim("  Scan QR with your phone to open instantly:"));
    printQrCode(publicUrl);
    console.log("");
  }
  console.log(import_picocolors2.default.dim("  Press Ctrl+C to stop sharing."));
  return {
    targetPort,
    publicUrl,
    lanUrl,
    adminUrl: localAdminUrl,
    adminPassword: pinGuard.telemetry.adminPassword,
    pin: options.pin,
    close: async () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (!isRender && hubUrl) {
        try {
          await fetch(`${hubUrl}/__peer_hub_disconnect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tunnelSessionId })
          });
        } catch {
        }
      }
      pinGuard.close();
      await tunnel.close();
    }
  };
}

// src/proxy.ts
var import_node_http2 = __toESM(require("http"), 1);
var import_node_buffer2 = require("buffer");

// src/protocol.ts
var CHUNK_SIZE = 32 * 1024;

// src/proxy.ts
var import_picocolors3 = __toESM(require("picocolors"), 1);
var LocalHttpProxy = class {
  targetPort;
  targetHost;
  onTraffic;
  constructor(options) {
    this.targetPort = options.targetPort;
    this.targetHost = options.targetHost || "localhost";
    this.onTraffic = options.onTraffic;
  }
  /**
   * Forwards a request received over WebRTC DataChannel to the local server
   * and sends the response back over the channel.
   */
  handleIncomingRequest(channel, req) {
    const startTime = Date.now();
    const url = req.url.startsWith("/") ? req.url : `/${req.url}`;
    const headers = { ...req.headers };
    headers["host"] = `${this.targetHost}:${this.targetPort}`;
    delete headers["connection"];
    delete headers["keep-alive"];
    const requestOptions = {
      hostname: this.targetHost,
      port: this.targetPort,
      path: url,
      method: req.method,
      headers,
      timeout: 3e4
    };
    const localReq = import_node_http2.default.request(requestOptions, (localRes) => {
      const statusCode = localRes.statusCode || 200;
      const statusMessage = localRes.statusMessage || "OK";
      const resHeaders = {};
      for (const [key, val] of Object.entries(localRes.headers)) {
        if (val !== void 0) {
          resHeaders[key] = Array.isArray(val) ? val.join(", ") : String(val);
        }
      }
      const chunks = [];
      localRes.on("data", (chunk) => {
        chunks.push(chunk);
      });
      localRes.on("end", () => {
        const fullBody = import_node_buffer2.Buffer.concat(chunks);
        const duration = Date.now() - startTime;
        this.logTraffic(req.method, url, statusCode, duration);
        if (this.onTraffic) {
          this.onTraffic({ method: req.method, url, status: statusCode, duration });
        }
        this.sendResponseOverChannel(channel, req.id, statusCode, statusMessage, resHeaders, fullBody);
      });
    });
    localReq.on("error", (err) => {
      const duration = Date.now() - startTime;
      console.error(import_picocolors3.default.red(`\u274C [Proxy Error] ${req.method} ${url}: ${err.message}`));
      const errorBody = import_node_buffer2.Buffer.from(
        `<h1>502 Bad Gateway - peer-port</h1><p>Cannot connect to localhost:${this.targetPort}: ${err.message}</p>`
      );
      this.sendResponseOverChannel(
        channel,
        req.id,
        502,
        "Bad Gateway",
        { "content-type": "text/html; charset=utf-8" },
        errorBody
      );
    });
    if (req.body) {
      if (req.isBase64) {
        localReq.write(import_node_buffer2.Buffer.from(req.body, "base64"));
      } else {
        localReq.write(req.body);
      }
    }
    localReq.end();
  }
  sendResponseOverChannel(channel, id, statusCode, statusMessage, headers, body) {
    if (channel.readyState !== "open") {
      return;
    }
    if (body.length <= CHUNK_SIZE) {
      const response = {
        type: "response",
        id,
        statusCode,
        statusMessage,
        headers,
        body: body.toString("base64"),
        isBase64: true
      };
      channel.send(JSON.stringify(response));
      return;
    }
    const totalChunks = Math.ceil(body.length / CHUNK_SIZE);
    const headerMsg = {
      type: "response-header",
      id,
      statusCode,
      statusMessage,
      headers
    };
    channel.send(JSON.stringify(headerMsg));
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, body.length);
      const slice = body.subarray(start, end);
      const chunkMsg = {
        type: "chunk",
        id,
        chunkIndex: i,
        totalChunks,
        data: slice.toString("base64"),
        isLast: i === totalChunks - 1
      };
      channel.send(JSON.stringify(chunkMsg));
    }
  }
  logTraffic(method, url, status, duration) {
    let statusColored = import_picocolors3.default.green(String(status));
    if (status >= 400 && status < 500) statusColored = import_picocolors3.default.yellow(String(status));
    if (status >= 500) statusColored = import_picocolors3.default.red(String(status));
    const methodColored = import_picocolors3.default.cyan(method.padEnd(6));
    const durationColored = import_picocolors3.default.dim(`${duration}ms`);
    console.log(`  ${import_picocolors3.default.magenta("\u21C4")} ${methodColored} ${import_picocolors3.default.white(url)} \u2192 ${statusColored} ${durationColored}`);
  }
};

// src/webrtc.ts
var import_werift = require("werift");
var import_picocolors4 = __toESM(require("picocolors"), 1);
var WebRtcBridge = class {
  pc;
  dataChannel = null;
  proxy;
  onConnected;
  onDisconnected;
  constructor(options) {
    this.proxy = options.proxy;
    this.onConnected = options.onConnected;
    this.onDisconnected = options.onDisconnected;
    this.pc = new import_werift.RTCPeerConnection();
    this.setupPeerEvents();
  }
  setupPeerEvents() {
    this.pc.connectionStateChange.subscribe((state) => {
      if (state === "connected") {
        console.log(import_picocolors4.default.green("  \u2714 WebRTC PeerConnection established! Direct P2P tunnel active."));
        if (this.onConnected) this.onConnected();
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        console.log(import_picocolors4.default.yellow(`  \u26A0 WebRTC PeerConnection state: ${state}`));
        if (this.onDisconnected) this.onDisconnected();
      }
    });
    this.pc.onDataChannel.subscribe((dc) => {
      this.attachDataChannel(dc);
    });
  }
  createLocalDataChannel(name = "peer-port-channel") {
    const dc = this.pc.createDataChannel(name, {
      ordered: true
    });
    this.attachDataChannel(dc);
    return dc;
  }
  attachDataChannel(channel) {
    this.dataChannel = channel;
    channel.stateChanged.subscribe((state) => {
      if (state === "open") {
        console.log(import_picocolors4.default.green("  \u2714 WebRTC DataChannel open! Ready for HTTP traffic."));
      } else if (state === "closed") {
        console.log(import_picocolors4.default.yellow("  \u26A0 WebRTC DataChannel closed."));
      }
    });
    channel.message.subscribe((data) => {
      try {
        const raw = typeof data === "string" ? data : data.toString();
        const parsed = JSON.parse(raw);
        if (parsed.type === "request") {
          this.proxy.handleIncomingRequest(channel, parsed);
        } else if (parsed.type === "ping") {
          channel.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch (err) {
        console.error(import_picocolors4.default.red(`  \u274C Failed to parse incoming WebRTC message: ${err.message}`));
      }
    });
  }
  /**
   * Creates an SDP Offer and sets it as the local description.
   * Resolves after all ICE candidates have been gathered into the SDP.
   */
  async createCompleteOffer() {
    this.createLocalDataChannel();
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    if (this.pc.iceGatheringState !== "complete") {
      await new Promise((resolve) => {
        const sub = this.pc.iceGatheringStateChange.subscribe((state) => {
          if (state === "complete") {
            resolve();
          }
        });
        setTimeout(resolve, 2500);
      });
    }
    return JSON.stringify(this.pc.localDescription);
  }
  /**
   * Sets the remote description with the answer from the browser viewer.
   */
  async handleAnswer(answerSdpJson) {
    const sdpObj = typeof answerSdpJson === "string" ? JSON.parse(answerSdpJson) : answerSdpJson;
    await this.pc.setRemoteDescription(sdpObj);
  }
  close() {
    try {
      if (this.dataChannel) {
        this.dataChannel.close();
      }
      this.pc.close();
    } catch {
    }
  }
};

// src/signaling.ts
var import_node_http3 = __toESM(require("http"), 1);
var import_node_process3 = __toESM(require("process"), 1);
var import_node_fs2 = __toESM(require("fs"), 1);
var import_node_path2 = __toESM(require("path"), 1);
var import_ws = require("ws");
var import_picocolors5 = __toESM(require("picocolors"), 1);
var SignalingServer = class {
  server;
  wss;
  bridge;
  viewerDir;
  port;
  constructor(options) {
    this.bridge = options.bridge;
    this.port = options.port || 4040;
    if (options.viewerDir) {
      this.viewerDir = options.viewerDir;
    } else {
      const candidates = [
        import_node_path2.default.join(import_node_process3.default.cwd(), "viewer"),
        import_node_path2.default.join(import_node_process3.default.cwd(), "..", "viewer"),
        import_node_path2.default.resolve("viewer")
      ];
      this.viewerDir = candidates.find((p) => import_node_fs2.default.existsSync(p)) || import_node_path2.default.join(import_node_process3.default.cwd(), "viewer");
    }
    this.server = import_node_http3.default.createServer((req, res) => this.handleHttpRequest(req, res));
    this.wss = new import_ws.WebSocketServer({ server: this.server, path: "/ws" });
    this.setupWebSocket();
  }
  handleHttpRequest(req, res) {
    const url = req.url || "/";
    if (url === "/sw.js") {
      const swPath = import_node_path2.default.join(this.viewerDir, "sw.js");
      if (import_node_fs2.default.existsSync(swPath)) {
        res.writeHead(200, {
          "Content-Type": "application/javascript; charset=utf-8",
          "Service-Worker-Allowed": "/",
          "Cache-Control": "no-cache"
        });
        import_node_fs2.default.createReadStream(swPath).pipe(res);
        return;
      }
    }
    const indexPath = import_node_path2.default.join(this.viewerDir, "index.html");
    if (import_node_fs2.default.existsSync(indexPath)) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache"
      });
      import_node_fs2.default.createReadStream(indexPath).pipe(res);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Viewer files not found.");
  }
  setupWebSocket() {
    this.wss.on("connection", async (ws) => {
      console.log(import_picocolors5.default.cyan("  \u{1F50C} Browser viewer connected for WebRTC handshake..."));
      try {
        const offerSdp = await this.bridge.createCompleteOffer();
        ws.send(JSON.stringify({ type: "offer", sdp: offerSdp }));
        ws.on("message", async (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            if (data.type === "answer") {
              console.log(import_picocolors5.default.cyan("  \u{1F4E5} Received WebRTC SDP Answer from browser viewer!"));
              await this.bridge.handleAnswer(data.sdp);
              ws.send(JSON.stringify({ type: "handshake-success" }));
            }
          } catch (err) {
            console.error(import_picocolors5.default.red(`  \u274C Failed handling signaling message: ${err.message}`));
          }
        });
      } catch (err) {
        console.error(import_picocolors5.default.red(`  \u274C Failed during signaling handshake: ${err.message}`));
      }
    });
  }
  async start() {
    return new Promise((resolve, reject) => {
      const tryListen = (attemptPort) => {
        this.server.once("error", (err) => {
          if (err.code === "EADDRINUSE") {
            tryListen(attemptPort + 1);
          } else {
            reject(err);
          }
        });
        this.server.listen(attemptPort, () => {
          this.port = attemptPort;
          resolve(attemptPort);
        });
      };
      tryListen(this.port);
    });
  }
  close() {
    this.wss.close();
    this.server.close();
  }
};

// src/p2p.ts
var import_picocolors6 = __toESM(require("picocolors"), 1);
async function startPeerTunnel(options) {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || "localhost";
  const proxy = new LocalHttpProxy({
    targetPort,
    targetHost
  });
  const bridge = new WebRtcBridge({
    proxy
  });
  const signaling = new SignalingServer({
    bridge,
    port: options.signalingPort || 4040
  });
  const actualSignalingPort = await signaling.start();
  const lanIp = getLocalIpAddress();
  const localUrl = `http://localhost:${actualSignalingPort}`;
  const lanUrl = `http://${lanIp}:${actualSignalingPort}`;
  console.log("\n" + import_picocolors6.default.bold(import_picocolors6.default.cyan("\u26A1 peer-port \u2014 P2P WebRTC Direct Tunnel")) + "\n");
  console.log(`  \u{1F3AF} Target App:      ${import_picocolors6.default.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  \u{1F4BB} Local Viewer:   ${import_picocolors6.default.underline(import_picocolors6.default.cyan(localUrl))}`);
  console.log(`  \u{1F4F1} Network / Phone: ${import_picocolors6.default.underline(import_picocolors6.default.bold(import_picocolors6.default.yellow(lanUrl)))}`);
  console.log(`  \u{1F512} Security:        Direct End-to-End P2P WebRTC DataChannel
`);
  if (!options.noQr) {
    console.log(import_picocolors6.default.dim("  Scan QR with your phone to open instantly:"));
    printQrCode(lanUrl);
    console.log("");
  }
  return {
    targetPort,
    signalingPort: actualSignalingPort,
    localUrl,
    lanUrl,
    close: () => {
      bridge.close();
      signaling.close();
    }
  };
}

// src/index.ts
var startTunnel = startGlobalTunnel;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CHUNK_SIZE,
  LocalHttpProxy,
  SignalingServer,
  WebRtcBridge,
  startGlobalTunnel,
  startPeerTunnel,
  startTunnel
});
//# sourceMappingURL=index.cjs.map