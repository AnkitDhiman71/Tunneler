#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// bin/peer-port.ts
var import_node_process4 = __toESM(require("process"), 1);
var import_commander = require("commander");

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

// src/visitor-intel.ts
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "\u{1F310}";
  const codePoints = countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
var COUNTRY_REGISTRY = {
  IN: { countryCode: "IN", countryName: "India", flag: "\u{1F1EE}\u{1F1F3}", lat: 28.7041, lng: 76.9535 },
  US: { countryCode: "US", countryName: "United States", flag: "\u{1F1FA}\u{1F1F8}", lat: 37.09, lng: -95.71 },
  GB: { countryCode: "GB", countryName: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", lat: 55.37, lng: -3.43 },
  CA: { countryCode: "CA", countryName: "Canada", flag: "\u{1F1E8}\u{1F1E6}", lat: 56.13, lng: -106.34 },
  DE: { countryCode: "DE", countryName: "Germany", flag: "\u{1F1E9}\u{1F1EA}", lat: 51.16, lng: 10.45 },
  FR: { countryCode: "FR", countryName: "France", flag: "\u{1F1EB}\u{1F1F7}", lat: 46.22, lng: 2.21 },
  AU: { countryCode: "AU", countryName: "Australia", flag: "\u{1F1E6}\u{1F1FA}", lat: -25.27, lng: 133.77 },
  JP: { countryCode: "JP", countryName: "Japan", flag: "\u{1F1EF}\u{1F1F5}", lat: 36.2, lng: 138.25 },
  SG: { countryCode: "SG", countryName: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", lat: 1.35, lng: 103.82 },
  AE: { countryCode: "AE", countryName: "UAE", flag: "\u{1F1E6}\u{1F1EA}", lat: 23.42, lng: 53.84 },
  BR: { countryCode: "BR", countryName: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", lat: -14.23, lng: -51.92 },
  NL: { countryCode: "NL", countryName: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", lat: 52.13, lng: 5.29 },
  RU: { countryCode: "RU", countryName: "Russia", flag: "\u{1F1F7}\u{1F1FA}", lat: 61.52, lng: 105.31 },
  CN: { countryCode: "CN", countryName: "China", flag: "\u{1F1E8}\u{1F1F3}", lat: 35.86, lng: 104.19 },
  IT: { countryCode: "IT", countryName: "Italy", flag: "\u{1F1EE}\u{1F1F9}", lat: 41.87, lng: 12.56 },
  ES: { countryCode: "ES", countryName: "Spain", flag: "\u{1F1EA}\u{1F1F8}", lat: 40.46, lng: -3.75 },
  PK: { countryCode: "PK", countryName: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}", lat: 30.37, lng: 69.34 },
  BD: { countryCode: "BD", countryName: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}", lat: 23.68, lng: 90.35 },
  ID: { countryCode: "ID", countryName: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", lat: -0.78, lng: 113.92 },
  ZA: { countryCode: "ZA", countryName: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", lat: -30.55, lng: 22.93 },
  SE: { countryCode: "SE", countryName: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", lat: 60.12, lng: 18.64 },
  CH: { countryCode: "CH", countryName: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", lat: 46.81, lng: 8.22 },
  KR: { countryCode: "KR", countryName: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", lat: 35.9, lng: 127.76 },
  MY: { countryCode: "MY", countryName: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", lat: 4.21, lng: 101.97 }
};
var VisitorIntelligence = class _VisitorIntelligence {
  visitors = /* @__PURE__ */ new Map();
  blockedIps = /* @__PURE__ */ new Set();
  static geoIpCache = /* @__PURE__ */ new Map();
  parseUserAgent(ua) {
    if (!ua) {
      return { deviceType: "Desktop", os: "Unknown OS", browser: "Browser" };
    }
    if (/bot|crawler|spider|curl|wget|postman|insomnia|headless/i.test(ua)) {
      return { deviceType: "Bot", os: "Automated Tool", browser: "Bot / API Client" };
    }
    let deviceType = "Desktop";
    if (/iPad|Tablet|PlayBook/i.test(ua)) {
      deviceType = "Tablet";
    } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = "Mobile";
    }
    let os2 = "Unknown OS";
    if (/Windows NT 10/i.test(ua)) os2 = "Windows 11 / 10";
    else if (/Windows NT/i.test(ua)) os2 = "Windows";
    else if (/iPhone|iPad|iPod/i.test(ua)) os2 = "iOS";
    else if (/Android/i.test(ua)) os2 = "Android";
    else if (/Mac OS X/i.test(ua)) os2 = "macOS";
    else if (/Linux/i.test(ua)) os2 = "Linux";
    else if (/CrOS/i.test(ua)) os2 = "ChromeOS";
    let browser = "Browser";
    if (/Edg\/([\d]+)/i.test(ua)) browser = `Edge ${RegExp.$1}`;
    else if (/OPR\/([\d]+)/i.test(ua)) browser = `Opera ${RegExp.$1}`;
    else if (/Chrome\/([\d]+)/i.test(ua)) browser = `Chrome ${RegExp.$1}`;
    else if (/Firefox\/([\d]+)/i.test(ua)) browser = `Firefox ${RegExp.$1}`;
    else if (/Version\/([\d]+).*Safari/i.test(ua)) browser = `Safari ${RegExp.$1}`;
    return { deviceType, os: os2, browser };
  }
  resolveGeo(headers = {}, ip = "", fallbackCountry) {
    const cfCountry = (headers["cf-ipcountry"] || headers["x-country-code"] || fallbackCountry || "").toUpperCase();
    if (cfCountry && COUNTRY_REGISTRY[cfCountry]) {
      return COUNTRY_REGISTRY[cfCountry];
    }
    if (ip && _VisitorIntelligence.geoIpCache.has(ip)) {
      return _VisitorIntelligence.geoIpCache.get(ip);
    }
    if (!ip || ip === "127.0.0.1" || ip === "localhost" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "LOCAL") {
      if (cfCountry && COUNTRY_REGISTRY[cfCountry]) {
        return COUNTRY_REGISTRY[cfCountry];
      }
      return { countryCode: "LOCAL", countryName: "Local Development Host (Haryana)", flag: "\u{1F4CD}", lat: 28.7041, lng: 76.9535 };
    }
    if (cfCountry && cfCountry.length === 2) {
      const flag = getFlagEmoji(cfCountry);
      return { countryCode: cfCountry, countryName: `Region (${cfCountry})`, flag, lat: 20, lng: 0 };
    }
    this.lookupPublicIpGeo(ip);
    return { countryCode: "IN", countryName: "India", flag: "\u{1F1EE}\u{1F1F3}", lat: 28.7041, lng: 76.9535 };
  }
  lookupPublicIpGeo(ip) {
    if (!ip || _VisitorIntelligence.geoIpCache.has(ip)) return;
    _VisitorIntelligence.geoIpCache.set(ip, { countryCode: "IN", countryName: "India", flag: "\u{1F1EE}\u{1F1F3}", lat: 28.7041, lng: 76.9535 });
    try {
      fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`).then((res) => res.ok ? res.json() : null).then((data) => {
        if (data && data.status === "success" && data.countryCode) {
          const code = data.countryCode.toUpperCase();
          const flag = getFlagEmoji(code);
          const cityName = data.city || data.regionName ? `${data.city ? data.city + ", " : ""}${data.regionName || ""}` : data.country || code;
          _VisitorIntelligence.geoIpCache.set(ip, {
            countryCode: code,
            countryName: cityName,
            flag,
            lat: data.lat || 28.7041,
            lng: data.lon || 76.9535
          });
        }
      }).catch(() => {
      });
    } catch {
    }
  }
  updateGpsFix(ip, lat, lng, accuracy) {
    let updated = false;
    for (const v of this.visitors.values()) {
      if (v.ip === ip || ip === "127.0.0.1" || ip === "localhost") {
        v.lat = lat;
        v.lng = lng;
        v.accuracy = accuracy;
        v.isGpsFix = true;
        if (lat >= 27.5 && lat <= 31 && lng >= 74 && lng <= 78.5) {
          v.countryName = "Haryana, India";
        }
        updated = true;
      }
    }
    return updated;
  }
  getBlockedCount() {
    return this.blockedIps.size;
  }
  recordHit(ip, url, headers, duration) {
    const ua = headers["user-agent"] || "";
    const visitorKey = `${ip}_${ua.slice(0, 30)}`;
    let profile = this.visitors.get(visitorKey);
    const now = Date.now();
    if (!profile) {
      const geo = this.resolveGeo(headers, ip);
      const parsedUA = this.parseUserAgent(ua);
      profile = {
        id: "vis_" + Math.random().toString(36).substring(2, 9),
        ip,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        flag: geo.flag,
        lat: geo.lat,
        lng: geo.lng,
        deviceType: parsedUA.deviceType,
        os: parsedUA.os,
        browser: parsedUA.browser,
        firstSeen: now,
        lastActive: now,
        requestCount: 1,
        visitedRoutes: [url.split("?")[0]],
        isBlocked: this.blockedIps.has(ip),
        avgLatency: duration,
        totalDuration: duration
      };
      this.visitors.set(visitorKey, profile);
    } else {
      profile.lastActive = now;
      profile.requestCount++;
      profile.totalDuration += duration;
      profile.avgLatency = Math.round(profile.totalDuration / profile.requestCount);
      const cleanRoute = url.split("?")[0];
      if (!profile.visitedRoutes.includes(cleanRoute)) {
        profile.visitedRoutes.push(cleanRoute);
        if (profile.visitedRoutes.length > 20) profile.visitedRoutes.shift();
      }
      profile.isBlocked = this.blockedIps.has(ip);
    }
    return profile;
  }
  toggleBlockIp(ip) {
    if (this.blockedIps.has(ip)) {
      this.blockedIps.delete(ip);
      for (const v of this.visitors.values()) {
        if (v.ip === ip) v.isBlocked = false;
      }
      return false;
    } else {
      this.blockedIps.add(ip);
      for (const v of this.visitors.values()) {
        if (v.ip === ip) v.isBlocked = true;
      }
      return true;
    }
  }
  isIpBlocked(ip) {
    return this.blockedIps.has(ip);
  }
  getVisitorsList() {
    return Array.from(this.visitors.values()).sort((a, b) => b.lastActive - a.lastActive).slice(0, 100);
  }
  getSummaryStats() {
    const visitors = this.getVisitorsList();
    const now = Date.now();
    const activeNow = visitors.filter((v) => now - v.lastActive < 12e4).length;
    const countryCounts = {};
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;
    for (const v of visitors) {
      if (!countryCounts[v.countryCode]) {
        countryCounts[v.countryCode] = { count: 0, name: v.countryName, flag: v.flag, lat: v.lat, lng: v.lng };
      }
      countryCounts[v.countryCode].count += v.requestCount;
      if (v.deviceType === "Mobile") mobileCount++;
      else if (v.deviceType === "Tablet") tabletCount++;
      else desktopCount++;
    }
    return {
      totalVisitors: visitors.length,
      activeNow,
      blockedCount: this.blockedIps.size,
      countries: Object.entries(countryCounts).map(([code, data]) => ({
        code,
        name: data.name,
        flag: data.flag,
        requests: data.count,
        lat: data.lat,
        lng: data.lng
      })),
      devices: {
        desktop: desktopCount,
        mobile: mobileCount,
        tablet: tabletCount
      }
    };
  }
};

// src/admin-extensions.ts
function renderWorldMapStyles() {
  return `
    /* MODERN SATELLITE RADAR MAP STYLES */
    .map-container {
      background: #0d1117;
      border: 1px solid rgba(240, 246, 252, 0.15);
      border-radius: 14px;
      padding: 1.25rem;
      position: relative;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.9rem;
      flex-wrap: wrap;
      gap: 10px;
    }
    .map-header h3 { font-size: 1.15rem; display: flex; align-items: center; gap: 8px; color: #fff; }
    .map-controls-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .map-stats { display: flex; gap: 15px; font-size: 0.85rem; color: #8b949e; align-items: center; }
    .map-stats span { color: #58a6ff; font-weight: 600; }
    .map-layer-selector {
      display: flex;
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid rgba(240, 246, 252, 0.15);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }
    .map-layer-btn {
      background: transparent;
      border: none;
      color: #8b949e;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }
    .map-layer-btn.active {
      background: #238636;
      color: #fff;
      box-shadow: 0 2px 8px rgba(35, 134, 54, 0.4);
    }
    .map-reset-btn {
      background: rgba(88, 166, 255, 0.15);
      border: 1px solid rgba(88, 166, 255, 0.3);
      color: #58a6ff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .map-reset-btn:hover {
      background: #58a6ff;
      color: #0d1117;
    }
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 520px;
      background: #040608;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      z-index: 1;
    }
    #leaflet-satellite-map {
      width: 100%;
      height: 100%;
      background: #06090e;
    }

    /* CUSTOM RADAR BEACON PIN */
    .leaflet-radar-divicon {
      background: transparent !important;
      border: none !important;
    }
    .radar-beacon {
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .radar-beacon-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #58a6ff;
      box-shadow: 0 0 15px #58a6ff;
      animation: beaconWave 2s infinite ease-out;
      pointer-events: none;
    }
    .radar-beacon-ring-2 {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #3fb950;
      box-shadow: 0 0 20px #3fb950;
      animation: beaconWave 2s infinite ease-out 1s;
      pointer-events: none;
    }
    @keyframes beaconWave {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    .radar-beacon-core {
      position: relative;
      width: 26px;
      height: 26px;
      background: rgba(13, 17, 23, 0.95);
      border: 2px solid #58a6ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 0 12px rgba(88, 166, 255, 0.8);
      transition: transform 0.2s;
    }
    .radar-beacon:hover .radar-beacon-core {
      transform: scale(1.4);
      border-color: #3fb950;
    }

    /* LEAFLET DARK THEME POPUPS */
    .leaflet-popup-content-wrapper {
      background: rgba(13, 17, 23, 0.96) !important;
      border: 1px solid rgba(88, 166, 255, 0.4) !important;
      border-radius: 12px !important;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(10px) !important;
      color: #e6edf3 !important;
      padding: 0 !important;
    }
    .leaflet-popup-tip {
      background: #0d1117 !important;
    }
    .leaflet-popup-content {
      margin: 12px 16px !important;
      line-height: 1.4 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    .map-popup-card {
      font-size: 0.85rem;
    }
    .map-popup-title {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      border-bottom: 1px solid rgba(240, 246, 252, 0.1);
      padding-bottom: 6px;
    }
    .map-popup-row {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
      color: #8b949e;
      font-size: 0.8rem;
      gap: 12px;
    }
    .map-popup-val {
      color: #fff;
      font-weight: 600;
    }
    .leaflet-control-zoom a {
      background: #161b22 !important;
      color: #e6edf3 !important;
      border: 1px solid rgba(240, 246, 252, 0.15) !important;
    }
    .leaflet-control-zoom a:hover {
      background: #21262d !important;
      color: #58a6ff !important;
    }
    .leaflet-control-attribution {
      background: rgba(13, 17, 23, 0.7) !important;
      color: #8b949e !important;
      font-size: 0.65rem !important;
    }
    .leaflet-control-attribution a {
      color: #58a6ff !important;
    }

    /* VISITOR STATS CARDS */
    .intel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .intel-card {
      background: #161b22;
      border: 1px solid rgba(240, 246, 252, 0.1);
      border-radius: 10px;
      padding: 1rem;
    }
    .intel-card .title { font-size: 0.78rem; color: #8b949e; text-transform: uppercase; margin-bottom: 6px; }
    .intel-card .val { font-size: 1.5rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }

    /* VISITOR TABLE & BADGES */
    .badge-device {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;
    }
    .badge-desktop { background: rgba(88, 166, 255, 0.15); color: #58a6ff; border: 1px solid rgba(88, 166, 255, 0.3); }
    .badge-mobile { background: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid rgba(63, 185, 80, 0.3); }
    .badge-tablet { background: rgba(210, 153, 34, 0.15); color: #d29922; border: 1px solid rgba(210, 153, 34, 0.3); }
    .badge-bot { background: rgba(248, 81, 73, 0.15); color: #f85149; border: 1px solid rgba(248, 81, 73, 0.3); }

    .route-pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.72rem;
      font-family: monospace;
      margin: 2px;
      color: #e6edf3;
    }

    /* API LAB STYLES */
    .api-lab-card {
      background: #161b22;
      border: 1px solid rgba(240, 246, 252, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .api-row {
      display: flex; gap: 8px; margin-bottom: 1rem;
    }
    .api-select {
      background: #0d1117; color: #58a6ff; font-weight: 700;
      border: 1px solid rgba(240, 246, 252, 0.2); border-radius: 6px;
      padding: 8px 12px; font-size: 0.9rem; outline: none;
    }
    .api-input {
      flex: 1; background: #0d1117; color: #fff;
      border: 1px solid rgba(240, 246, 252, 0.2); border-radius: 6px;
      padding: 8px 12px; font-size: 0.9rem; font-family: monospace; outline: none;
    }
    .api-btn-send {
      background: #238636; color: #fff; border: none;
      padding: 8px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px; font-size: 0.9rem;
    }
    .api-btn-send:hover { background: #2ea043; }

    .api-tab-btns { display: flex; gap: 8px; margin-bottom: 8px; }
    .api-mini-tab {
      background: transparent; border: 1px solid rgba(240, 246, 252, 0.15);
      color: #8b949e; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer;
    }
    .api-mini-tab.active { background: rgba(88, 166, 255, 0.15); color: #58a6ff; border-color: #58a6ff; }

    .api-textarea {
      width: 100%; height: 110px; background: #0d1117; color: #e6edf3;
      border: 1px solid rgba(240, 246, 252, 0.15); border-radius: 6px;
      padding: 10px; font-family: monospace; font-size: 0.82rem; resize: vertical; outline: none;
    }

    .api-response-box {
      margin-top: 1rem; background: #090d13; border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px; padding: 1rem;
    }
    .response-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.85rem;
    }
    .response-body-pre {
      max-height: 240px; overflow: auto; background: #040608; padding: 10px; border-radius: 6px;
      font-family: monospace; font-size: 0.8rem; color: #7ee787; white-space: pre-wrap; word-break: break-all;
    }

    /* SECURITY AUDIT BADGES */
    .audit-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem;
    }
    .audit-item {
      background: #0d1117; border: 1px solid rgba(240, 246, 252, 0.1); border-radius: 8px; padding: 12px;
    }
    .audit-item .status { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .audit-item .desc { font-size: 0.75rem; color: #8b949e; line-height: 1.3; }
  `;
}
function renderSatelliteMapContainer(summary) {
  return `
    <div class="map-container">
      <div class="map-header">
        <h3>\u{1F6F0}\uFE0F Real-Time Global Visitor Radar</h3>
        <div class="map-controls-bar">
          <div class="map-layer-selector">
            <button class="map-layer-btn active" id="btn-layer-sat" onclick="switchMapLayer('satellite')">\u{1F6F0}\uFE0F Satellite</button>
            <button class="map-layer-btn" id="btn-layer-dark" onclick="switchMapLayer('dark')">\u{1F30C} Cyber Dark</button>
            <button class="map-layer-btn" id="btn-layer-streets" onclick="switchMapLayer('streets')">\u{1F5FA}\uFE0F Streets</button>
          </div>
          <button class="map-reset-btn" onclick="resetMapView()" title="Reset to global overview">\u{1F30D} Overview</button>
          <div class="map-stats">
            <div>Countries: <span id="map-country-count">${summary.countries.length}</span></div>
            <div>Online: <span id="map-active-count">${summary.activeNow}</span></div>
          </div>
        </div>
      </div>
      <div class="map-wrapper" id="world-map-wrap">
        <div id="leaflet-satellite-map"></div>
      </div>
    </div>
  `;
}
function renderVisitorIntelligencePanel(summary, visitors) {
  return `
    <div class="panel" id="panel-visitors" style="display: none;">
      <div class="panel-header">
        <h2>\u{1F465} Real-Time Visitor Intelligence & Device Inspector</h2>
        <p>Inspect incoming visitor traffic, device fingerprints, visited pages, and manage IP firewall rules.</p>
      </div>

      <!-- INTEL METRIC CARDS -->
      <div class="intel-grid">
        <div class="intel-card">
          <div class="title">Active Visitors Now</div>
          <div class="val" id="val-intel-active" style="color: #3fb950;">\u{1F7E2} ${summary.activeNow} <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">online</span></div>
        </div>
        <div class="intel-card">
          <div class="title">Total Distinct Visitors</div>
          <div class="val" id="val-intel-total">\u{1F465} ${summary.totalVisitors}</div>
        </div>
        <div class="intel-card">
          <div class="title">Global Geographic Reach</div>
          <div class="val" id="val-intel-reach">\u{1F30D} ${summary.countries.length} <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">countries</span></div>
        </div>
        <div class="intel-card">
          <div class="title">Mobile vs Desktop</div>
          <div class="val" id="val-intel-devices" style="font-size: 1.1rem; color: #58a6ff;">
            \u{1F4F1} ${summary.devices.mobile} \u2022 \u{1F4BB} ${summary.devices.desktop} \u2022 \u{1F4DF} ${summary.devices.tablet}
          </div>
        </div>
      </div>

      <!-- VISITOR TABLE -->
      <table>
        <thead>
          <tr>
            <th>Visitor / IP Address</th>
            <th>Location</th>
            <th>Device & OS</th>
            <th>Browser</th>
            <th>Pages Visited</th>
            <th>Requests</th>
            <th>Status</th>
            <th>Firewall Action</th>
          </tr>
        </thead>
        <tbody id="table-visitors-body">
          ${visitors.length === 0 ? '<tr><td colspan="8" style="text-align: center; color: #8b949e; padding: 2rem;">No visitors recorded yet. Open your public tunnel link to see your session appear here live!</td></tr>' : visitors.map(
    (v) => `
            <tr class="website-row" id="row-vis-${v.id}">
              <td style="font-family: monospace; font-weight: 600; color: #58a6ff;">
                ${v.ip}
              </td>
              <td>
                <span style="font-size: 1.1rem;">${v.flag}</span> ${v.countryName}
              </td>
              <td>
                <span class="badge-device badge-${v.deviceType.toLowerCase()}">
                  ${v.deviceType === "Mobile" ? "\u{1F4F1}" : v.deviceType === "Tablet" ? "\u{1F4DF}" : "\u{1F4BB}"} ${v.os}
                </span>
              </td>
              <td style="color: #e6edf3;">
                ${v.browser}
              </td>
              <td>
                ${v.visitedRoutes.map((r) => `<span class="route-pill">${r}</span>`).join("")}
              </td>
              <td>
                <strong>${v.requestCount}</strong> <span style="font-size: 0.75rem; color: #8b949e;">(${v.avgLatency}ms)</span>
              </td>
              <td>
                ${Date.now() - v.lastActive < 12e4 ? '<span class="status-badge-live">\u{1F7E2} Online</span>' : '<span style="color: #8b949e; font-size: 0.8rem;">\u26AA Idle</span>'}
              </td>
              <td>
                <button 
                  onclick="toggleBlockVisitorIp('${v.ip}')"
                  style="background: ${v.isBlocked ? "#238636" : "#da3633"}; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                  ${v.isBlocked ? "\u2705 Unblock IP" : "\u{1F6AB} Ban IP"}
                </button>
              </td>
            </tr>
          `
  ).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function renderApiLaboratoryPanel() {
  return `
    <div class="panel" id="panel-apilab" style="display: none;">
      <div class="panel-header">
        <h2>\u26A1 Live API Laboratory, Traffic Replayer & Security Posture</h2>
        <p>Replay captured client API requests, test endpoints in real time, generate cURL commands, and audit tunnel security.</p>
      </div>

      <!-- REST API PLAYGROUND -->
      <div class="api-lab-card">
        <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #58a6ff; display: flex; align-items: center; gap: 8px;">
          \u{1F9EA} Embedded REST API Console
        </h3>
        <div class="api-row">
          <select id="api-method" class="api-select">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <input type="text" id="api-url" class="api-input" placeholder="/api/health or /api/auth/login" value="/api/health" />
          <button class="api-btn-send" onclick="sendApiLabRequest()">
            \u25B6 Send Request
          </button>
          <button class="btn-copy" onclick="copyApiAsCurl()" title="Copy as cURL command">
            \u{1F4CB} Copy cURL
          </button>
        </div>

        <div>
          <div class="api-tab-btns">
            <button class="api-mini-tab active" id="tab-btn-headers" onclick="switchApiTab('headers')">Headers</button>
            <button class="api-mini-tab" id="tab-btn-body" onclick="switchApiTab('body')">JSON Body</button>
            <span style="font-size: 0.75rem; color: #8b949e; margin-left: auto;">Templates: 
              <a href="javascript:void(0)" onclick="loadApiTemplate('json')" style="color: #58a6ff;">JSON</a> | 
              <a href="javascript:void(0)" onclick="loadApiTemplate('auth')" style="color: #58a6ff;">Auth</a> | 
              <a href="javascript:void(0)" onclick="loadApiTemplate('empty')" style="color: #58a6ff;">Clear</a>
            </span>
          </div>

          <textarea id="api-headers-input" class="api-textarea" placeholder='{"Content-Type": "application/json"}'>{"Content-Type": "application/json"}</textarea>
          <textarea id="api-body-input" class="api-textarea" style="display: none;" placeholder='{"key": "value"}'></textarea>
        </div>

        <div id="api-response-wrapper" class="api-response-box" style="display: none;">
          <div class="response-header">
            <div>
              <strong id="api-res-status" style="color: #3fb950; font-size: 0.95rem;">200 OK</strong>
              <span id="api-res-time" style="color: #8b949e; margin-left: 10px;">12 ms</span>
            </div>
            <button class="btn-copy" onclick="copyText(document.getElementById('api-res-body').innerText)">\u{1F4CB} Copy Response</button>
          </div>
          <pre id="api-res-body" class="response-body-pre"></pre>
        </div>
      </div>

      <!-- 1-CLICK TUNNEL SECURITY & PERFORMANCE AUDIT -->
      <div class="api-lab-card">
        <h3 style="font-size: 1rem; color: #3fb950; display: flex; align-items: center; gap: 8px;">
          \u{1F6E1}\uFE0F Live Tunnel Security & Posture Scorecard
        </h3>
        <div class="audit-grid">
          <div class="audit-item">
            <div class="status" style="color: #3fb950;">\u{1F512} Edge TLS 1.3 Encryption</div>
            <div class="desc">Active Cloudflare Anycast edge with strict HTTPS termination and encrypted packet forwarding.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #58a6ff;">\u{1F6E1}\uFE0F Gatekeeper Authentication</div>
            <div class="desc">Cookie-based cryptographic token verification prevents unauthorized direct access.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #3fb950;">\u26A1 Rolling Latency Rating: A+</div>
            <div class="desc">Sub-40ms loopback reverse proxy streaming with zero in-memory payload buffering.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #d29922;">\u{1F6AB} Page-Level Quarantine Engine</div>
            <div class="desc">Granular route-level blocklist active. Sensitive endpoints can be frozen without dropping the tunnel.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// src/admin.ts
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
  visitorIntel = new VisitorIntelligence();
  isIpBlocked(ip) {
    return this.visitorIntel.isIpBlocked(ip);
  }
  toggleBlockVisitorIp(ip) {
    return this.visitorIntel.toggleBlockIp(ip);
  }
  updateVisitorGps(ip, lat, lng, accuracy) {
    const updated = this.visitorIntel.updateGpsFix(ip, lat, lng, accuracy);
    for (const t of this.remoteTunnels.values()) {
      if (t.visitors) {
        for (const v of t.visitors) {
          if (v.ip === ip || ip === "127.0.0.1" || ip === "localhost") {
            v.lat = lat;
            v.lng = lng;
            v.accuracy = accuracy;
            v.isGpsFix = true;
            if (lat >= 27.5 && lat <= 31 && lng >= 74 && lng <= 78.5) {
              v.countryName = "Haryana, India";
            }
          }
        }
      }
    }
    return updated;
  }
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
  registerRemoteTunnel(info, clientIp, cfCountry) {
    const tunnel = {
      id: info.id || "tun_" + Math.random().toString(36).substring(2, 9),
      publicUrl: info.publicUrl || "",
      target: info.target || "localhost:3000",
      clientIp: clientIp || "127.0.0.1",
      cfCountry: cfCountry || info.cfCountry || "",
      startedAt: info.startedAt || Date.now(),
      lastPing: Date.now(),
      totalRequests: info.totalRequests || 0,
      activeRequests: info.activeRequests || 0,
      uniqueVisitors: info.uniqueVisitors || 1,
      avgLatency: info.avgLatency || 0,
      isPaused: false,
      disabledPages: [],
      requestGroups: info.requestGroups || [],
      feedbacks: info.feedbacks || [],
      visitors: info.visitors || []
    };
    this.syncTunnelVisitors(tunnel, info);
    this.remoteTunnels.set(tunnel.id, tunnel);
    return tunnel;
  }
  updateRemoteTunnel(info, clientIp, cfCountry) {
    const tunnel = this.remoteTunnels.get(info.id);
    if (!tunnel) return void 0;
    tunnel.lastPing = Date.now();
    if (clientIp) tunnel.clientIp = clientIp;
    if (cfCountry) tunnel.cfCountry = cfCountry;
    if (info.publicUrl) tunnel.publicUrl = info.publicUrl;
    if (info.totalRequests !== void 0) tunnel.totalRequests = info.totalRequests;
    if (info.activeRequests !== void 0) tunnel.activeRequests = info.activeRequests;
    if (info.uniqueVisitors !== void 0) tunnel.uniqueVisitors = info.uniqueVisitors;
    if (info.avgLatency !== void 0) tunnel.avgLatency = info.avgLatency;
    if (info.requestGroups) tunnel.requestGroups = info.requestGroups;
    if (info.feedbacks) tunnel.feedbacks = info.feedbacks;
    this.syncTunnelVisitors(tunnel, info);
    return tunnel;
  }
  syncTunnelVisitors(tunnel, info) {
    if (info.visitors && Array.isArray(info.visitors) && info.visitors.length > 0) {
      tunnel.visitors = info.visitors;
      return;
    }
    const visitorsMap = /* @__PURE__ */ new Map();
    const now = Date.now();
    if (tunnel.requestGroups && tunnel.requestGroups.length > 0) {
      for (const group of tunnel.requestGroups) {
        let ip = group.ip || "127.0.0.1";
        if ((ip === "127.0.0.1" || ip === "localhost" || ip === "::1" || ip.startsWith("192.168.")) && tunnel.clientIp && tunnel.clientIp !== "127.0.0.1" && tunnel.clientIp !== "::1") {
          ip = tunnel.clientIp;
        }
        const cleanRoute = (group.url || "/").split("?")[0];
        let profile = visitorsMap.get(ip);
        if (!profile) {
          const geo = this.visitorIntel.resolveGeo({}, ip, tunnel.cfCountry);
          profile = {
            id: "vis_" + Math.random().toString(36).substring(2, 9),
            ip,
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            flag: geo.flag,
            lat: geo.lat,
            lng: geo.lng,
            deviceType: "Desktop",
            os: "Windows 11 / 10",
            browser: "Chrome",
            firstSeen: group.timestamp || tunnel.startedAt,
            lastActive: group.timestamp || now,
            requestCount: 1,
            visitedRoutes: [cleanRoute],
            isBlocked: this.visitorIntel.isIpBlocked(ip),
            avgLatency: group.duration || tunnel.avgLatency || 150,
            totalDuration: group.duration || tunnel.avgLatency || 150
          };
          visitorsMap.set(ip, profile);
        } else {
          profile.requestCount++;
          profile.totalDuration += group.duration || 0;
          profile.avgLatency = Math.round(profile.totalDuration / profile.requestCount);
          profile.lastActive = Math.max(profile.lastActive, group.timestamp || now);
          profile.firstSeen = Math.min(profile.firstSeen, group.timestamp || tunnel.startedAt);
          if (!profile.visitedRoutes.includes(cleanRoute)) {
            profile.visitedRoutes.push(cleanRoute);
            if (profile.visitedRoutes.length > 20) profile.visitedRoutes.shift();
          }
          profile.isBlocked = this.visitorIntel.isIpBlocked(ip);
        }
      }
    }
    if (visitorsMap.size === 0 && (tunnel.totalRequests > 0 || tunnel.uniqueVisitors > 0)) {
      const ip = tunnel.clientIp || "127.0.0.1";
      const geo = this.visitorIntel.resolveGeo({}, ip, tunnel.cfCountry);
      const profile = {
        id: "vis_" + tunnel.id.substring(0, 8),
        ip,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        flag: geo.flag,
        lat: geo.lat,
        lng: geo.lng,
        deviceType: "Desktop",
        os: "Windows 11 / 10",
        browser: "Chrome",
        firstSeen: tunnel.startedAt,
        lastActive: tunnel.lastPing,
        requestCount: tunnel.totalRequests || 1,
        visitedRoutes: ["/"],
        isBlocked: this.visitorIntel.isIpBlocked(ip),
        avgLatency: tunnel.avgLatency || 150,
        totalDuration: (tunnel.avgLatency || 150) * (tunnel.totalRequests || 1)
      };
      visitorsMap.set(ip, profile);
    }
    tunnel.visitors = Array.from(visitorsMap.values());
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
    this.visitorIntel.recordHit(ip, url, headers, duration);
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
    const effectiveUrl = this.publicUrl || `http://${this.targetHost}:${this.targetPort}`;
    const tunnelsList = [];
    const allVisitorsMap = /* @__PURE__ */ new Map();
    const aggUniqueVisitorIps = /* @__PURE__ */ new Set();
    for (const ip of this.uniqueVisitors) {
      aggUniqueVisitorIps.add(ip);
    }
    for (const v of this.visitorIntel.getVisitorsList()) {
      allVisitorsMap.set(v.ip, { ...v });
    }
    let aggTotalRequests = this.totalRequests;
    let aggActiveRequests = this.activeRequests;
    let aggTotalDuration = this.totalDuration;
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
      aggTotalRequests += t.totalRequests || 0;
      aggActiveRequests += t.activeRequests || 0;
      aggTotalDuration += (t.avgLatency || 0) * (t.totalRequests || 0);
      const tunnelVisitors = t.visitors || [];
      for (const v of tunnelVisitors) {
        aggUniqueVisitorIps.add(v.ip);
        if (!allVisitorsMap.has(v.ip)) {
          allVisitorsMap.set(v.ip, { ...v });
        } else {
          const existing = allVisitorsMap.get(v.ip);
          existing.requestCount += v.requestCount;
          existing.totalDuration += v.totalDuration;
          existing.avgLatency = Math.round(existing.totalDuration / Math.max(1, existing.requestCount));
          existing.lastActive = Math.max(existing.lastActive, v.lastActive);
          for (const r of v.visitedRoutes) {
            if (!existing.visitedRoutes.includes(r)) existing.visitedRoutes.push(r);
          }
        }
      }
    }
    const isRender = Boolean(import_node_process.default.env.RENDER);
    const localAvgLatency = this.totalRequests > 0 ? Math.round(this.totalDuration / this.totalRequests) : 0;
    if (!isRender && tunnelsList.length === 0 || this.publicUrl && !this.publicUrl.includes("onrender.com")) {
      tunnelsList.push({
        id: "local_tunnel",
        publicUrl: effectiveUrl,
        target: `http://${this.targetHost}:${this.targetPort}`,
        startedAt: this.startedAt,
        totalRequests: this.totalRequests,
        uniqueVisitors: this.uniqueVisitors.size,
        avgLatency: localAvgLatency,
        isPaused: this.isPaused,
        disabledPages: Array.from(this.disabledPages),
        requestGroups: this.requestGroups.slice(0, 50),
        feedbacks: this.feedbacks
      });
    }
    const visitors = Array.from(allVisitorsMap.values()).sort((a, b) => b.lastActive - a.lastActive);
    const now = Date.now();
    const activeNow = visitors.filter((v) => now - v.lastActive < 12e4).length;
    const countryCounts = {};
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;
    for (const v of visitors) {
      if (!countryCounts[v.countryCode]) {
        countryCounts[v.countryCode] = { count: 0, name: v.countryName, flag: v.flag, lat: v.lat, lng: v.lng };
      }
      countryCounts[v.countryCode].count += v.requestCount;
      if (v.deviceType === "Mobile") mobileCount++;
      else if (v.deviceType === "Tablet") tabletCount++;
      else desktopCount++;
    }
    const visitorSummary = {
      totalVisitors: Math.max(visitors.length, aggUniqueVisitorIps.size),
      activeNow,
      blockedCount: this.visitorIntel.getBlockedCount(),
      countries: Object.entries(countryCounts).map(([code, data]) => ({
        code,
        name: data.name,
        flag: data.flag,
        requests: data.count,
        lat: data.lat,
        lng: data.lng
      })),
      devices: {
        desktop: desktopCount,
        mobile: mobileCount,
        tablet: tabletCount
      }
    };
    const overallAvgLatency = aggTotalRequests > 0 ? Math.round(aggTotalDuration / aggTotalRequests) : 0;
    const overallUniqueVisitors = Math.max(aggUniqueVisitorIps.size, visitors.length);
    return {
      publicUrl: effectiveUrl,
      targetHost: this.targetHost,
      targetPort: this.targetPort,
      startedAt: this.startedAt,
      totalRequests: aggTotalRequests,
      activeRequests: aggActiveRequests,
      uniqueVisitors: overallUniqueVisitors,
      avgLatency: overallAvgLatency,
      isPaused: this.isPaused,
      disabledPages: Array.from(this.disabledPages),
      statusCounts: this.statusCounts,
      feedbacksCount: this.feedbacks.filter((f) => !f.resolved).length,
      requestGroups: this.requestGroups.slice(0, 50),
      feedbacks: this.feedbacks,
      tunnels: tunnelsList,
      visitorSummary,
      visitors
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
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
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
    ${renderWorldMapStyles()}
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
      <button class="tab-btn" onclick="switchTab('map', this)">\u{1F5FA}\uFE0F Global Radar (<span id="tab-cnt-countries">${stats.visitorSummary.countries.length}</span>)</button>
      <button class="tab-btn" onclick="switchTab('visitors', this)">\u{1F465} Visitor Intelligence (<span id="tab-cnt-visitors">${stats.visitorSummary.totalVisitors}</span>)</button>
      <button class="tab-btn" onclick="switchTab('apilab', this)">\u26A1 API Laboratory</button>
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

    <!-- TAB: WORLD RADAR MAP -->
    <div class="panel" id="panel-map" style="display: none;">
      ${renderSatelliteMapContainer(stats.visitorSummary)}
    </div>

    <!-- TAB: VISITOR INTELLIGENCE -->
    ${renderVisitorIntelligencePanel(stats.visitorSummary, stats.visitors)}

    <!-- TAB: API LABORATORY -->
    ${renderApiLaboratoryPanel()}

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

    let leafletMap = null;
    let leafletLayers = {};
    let activeLayerName = 'satellite';
    let visitorMarkersGroup = null;

    function initLeafletSatelliteMap() {
      if (leafletMap || typeof L === 'undefined') {
        if (leafletMap) setTimeout(() => leafletMap.invalidateSize(), 80);
        return;
      }
      const mapContainer = document.getElementById('leaflet-satellite-map');
      if (!mapContainer) return;

      try {
        // 1. ESRI High-Resolution Photorealistic Satellite Imagery Layer
        const satLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
            maxZoom: 18,
          }
        );

        // Labels overlay for Satellite so borders and cities are crystal clear
        const labelsLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
            opacity: 0.9,
          }
        );
        const satGroup = L.layerGroup([satLayer, labelsLayer]);

        // 2. CartoDB Dark Matter Cyber Radar Layer
        const darkLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; CartoDB',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        );

        // 3. OpenStreetMap Streets Layer
        const streetLayer = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }
        );

        leafletLayers = {
          satellite: satGroup,
          dark: darkLayer,
          streets: streetLayer,
        };

        leafletMap = L.map('leaflet-satellite-map', {
          center: [28.7041, 76.9535],
          zoom: 5,
          minZoom: 2,
          maxZoom: 18,
          layers: [satGroup],
          zoomControl: true,
          worldCopyJump: true,
        });

        visitorMarkersGroup = L.layerGroup().addTo(leafletMap);
        window.leafletMap = leafletMap;

        if (currentStats && currentStats.visitorSummary) {
          updateMapMarkers(currentStats.visitorSummary.countries, currentStats.visitors);
        }
      } catch (e) {
        console.error('Leaflet initialization error:', e);
      }
    }

    function switchMapLayer(layerName) {
      if (!leafletMap || !leafletLayers[layerName]) return;
      document.querySelectorAll('.map-layer-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('btn-layer-' + (layerName === 'satellite' ? 'sat' : layerName));
      if (activeBtn) activeBtn.classList.add('active');

      Object.values(leafletLayers).forEach(layer => leafletMap.removeLayer(layer));
      leafletMap.addLayer(leafletLayers[layerName]);
      activeLayerName = layerName;
    }

    function resetMapView() {
      if (!leafletMap) return;
      leafletMap.setView([28.7041, 76.9535], 5, { animate: true });
    }

    function updateMapMarkers(countries, visitors) {
      if (!leafletMap || !visitorMarkersGroup) return;
      visitorMarkersGroup.clearLayers();

      const list = countries || [];
      const visList = visitors || [];

      list.forEach(c => {
        if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return;

        const radarIcon = L.divIcon({
          className: 'leaflet-radar-divicon',
          html: '<div class="radar-beacon"><div class="radar-beacon-ring"></div><div class="radar-beacon-ring-2"></div><div class="radar-beacon-core"><span>' + (c.flag || '\u{1F4CD}') + '</span></div></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const countryVisitors = visList.filter(v => v.countryCode === c.code || (c.code === 'IN' && v.countryCode === 'LOCAL'));
        const hasGps = countryVisitors.some(v => v.isGpsFix);
        const topRoutes = Array.from(new Set(countryVisitors.flatMap(v => v.visitedRoutes || []))).slice(0, 3);

        const popupHtml = '<div class="map-popup-card">' +
          '<div class="map-popup-title">' + (c.flag || '') + ' ' + (c.name || 'Visitor') + '</div>' +
          '<div class="map-popup-row"><span>Status:</span><span class="map-popup-val" style="color: #3fb950;">\u{1F7E2} Live Traffic</span></div>' +
          (hasGps ? '<div class="map-popup-row"><span>Precision:</span><span class="map-popup-val" style="color: #3fb950;">\u{1F6F0}\uFE0F Exact Satellite GPS Fix</span></div>' : '') +
          '<div class="map-popup-row"><span>Total Requests:</span><span class="map-popup-val">' + (c.requests || 1) + '</span></div>' +
          '<div class="map-popup-row"><span>Coordinates:</span><span class="map-popup-val">' + c.lat.toFixed(4) + '\xB0, ' + c.lng.toFixed(4) + '\xB0</span></div>' +
          (topRoutes.length ? '<div class="map-popup-row"><span>Routes:</span><span class="map-popup-val" style="font-family: monospace;">' + topRoutes.join(', ') + '</span></div>' : '') +
          '</div>';

        const marker = L.marker([c.lat, c.lng], { icon: radarIcon })
          .bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

        marker.on('mouseover', function () { this.openPopup(); });
        visitorMarkersGroup.addLayer(marker);
      });
    }

    window.addEventListener('load', () => {
      setTimeout(initLeafletSatelliteMap, 300);
    });

    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panels = ['websites', 'map', 'visitors', 'apilab', 'feedback', 'pages'];
      panels.forEach(p => {
        const el = document.getElementById('panel-' + p);
        if (el) el.style.display = tab === p ? 'block' : 'none';
      });
      if (tab === 'map') {
        initLeafletSatelliteMap();
        if (window.leafletMap) {
          setTimeout(() => window.leafletMap.invalidateSize(), 80);
        }
      }
    }

    async function toggleBlockVisitorIp(ip) {
      if (!confirm('Toggle firewall ban for IP: ' + ip + '?')) return;
      const res = await sendAdminAction('toggle_block_ip', { ip });
      if (res && res.success) updateUIState(res.stats);
    }

    async function sendApiLabRequest() {
      const method = document.getElementById('api-method').value;
      const path = document.getElementById('api-url').value;
      let headers = {};
      try {
        headers = JSON.parse(document.getElementById('api-headers-input').value || '{}');
      } catch (e) {
        alert('Invalid JSON in headers: ' + e.message);
        return;
      }
      let body = document.getElementById('api-body-input').value;

      const resBox = document.getElementById('api-response-wrapper');
      const resStatus = document.getElementById('api-res-status');
      const resTime = document.getElementById('api-res-time');
      const resBody = document.getElementById('api-res-body');

      resStatus.textContent = 'Executing...';
      resStatus.style.color = '#58a6ff';
      resBox.style.display = 'block';

      try {
        const res = await fetch('/__peer_admin_api_test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method, path, headers, body })
        });
        const data = await res.json();
        resStatus.textContent = data.status + (data.status < 400 ? ' OK' : ' Error');
        resStatus.style.color = data.status < 400 ? '#3fb950' : '#f85149';
        resTime.textContent = data.duration + ' ms';
        try {
          resBody.textContent = JSON.stringify(JSON.parse(data.body), null, 2);
        } catch {
          resBody.textContent = data.body || '(empty response)';
        }
      } catch (err) {
        resStatus.textContent = 'Failed';
        resStatus.style.color = '#f85149';
        resBody.textContent = err.message;
      }
    }

    function switchApiTab(tab) {
      document.getElementById('tab-btn-headers').className = tab === 'headers' ? 'api-mini-tab active' : 'api-mini-tab';
      document.getElementById('tab-btn-body').className = tab === 'body' ? 'api-mini-tab active' : 'api-mini-tab';
      document.getElementById('api-headers-input').style.display = tab === 'headers' ? 'block' : 'none';
      document.getElementById('api-body-input').style.display = tab === 'body' ? 'block' : 'none';
    }

    function loadApiTemplate(tpl) {
      if (tpl === 'json') {
        document.getElementById('api-headers-input').value = '{\\n  "Content-Type": "application/json"\\n}';
        document.getElementById('api-body-input').value = '{\\n  "name": "Test Item",\\n  "timestamp": ' + Date.now() + '\\n}';
      } else if (tpl === 'auth') {
        document.getElementById('api-headers-input').value = '{\\n  "Content-Type": "application/json"\\n}';
        document.getElementById('api-body-input').value = '{\\n  "email": "user@example.com",\\n  "password": "Password123"\\n}';
      } else {
        document.getElementById('api-headers-input').value = '{}';
        document.getElementById('api-body-input').value = '';
      }
    }

    function copyApiAsCurl() {
      const method = document.getElementById('api-method').value;
      const path = document.getElementById('api-url').value;
      const body = document.getElementById('api-body-input').value;
      const host = window.location.origin;
      let curl = 'curl -X ' + method + ' "' + host + path + '"';
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        curl += " -H 'Content-Type: application/json' -d '" + body.replace(/'/g, "\\'") + "'";
      }
      copyText(curl);
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

      // Update Visitor Intelligence Table
      const visTable = document.getElementById('table-visitors-body');
      if (visTable && data.visitors) {
        if (data.visitors.length === 0) {
          visTable.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #8b949e; padding: 2rem;">No visitors recorded yet. Open your public tunnel link to see your session appear here live!</td></tr>';
        } else {
          visTable.innerHTML = data.visitors.map(v => \`
            <tr class="website-row" id="row-vis-\${v.id}">
              <td style="font-family: monospace; font-weight: 600; color: #58a6ff;">\${v.ip}</td>
              <td><span style="font-size: 1.1rem;">\${v.flag}</span> \${v.countryName}</td>
              <td><span class="badge-device badge-\${v.deviceType.toLowerCase()}">\${v.deviceType === 'Mobile' ? '\u{1F4F1}' : v.deviceType === 'Tablet' ? '\u{1F4DF}' : '\u{1F4BB}'} \${v.os}</span></td>
              <td style="color: #e6edf3;">\${v.browser}</td>
              <td>\${v.visitedRoutes.map(r => \`<span class="route-pill">\${r}</span>\`).join('')}</td>
              <td><strong>\${v.requestCount}</strong> <span style="font-size: 0.75rem; color: #8b949e;">(\${v.avgLatency}ms)</span></td>
              <td>\${Date.now() - v.lastActive < 120000 ? '<span class="status-badge-live">\u{1F7E2} Online</span>' : '<span style="color: #8b949e; font-size: 0.8rem;">\u26AA Idle</span>'}</td>
              <td>
                <button onclick="toggleBlockVisitorIp('\${v.ip}')" style="background: \${v.isBlocked ? '#238636' : '#da3633'}; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                  \${v.isBlocked ? '\u2705 Unblock IP' : '\u{1F6AB} Ban IP'}
                </button>
              </td>
            </tr>
          \`).join('');
        }
      }

      // Update Tab Counter Badges & Map Stats
      if (data.visitorSummary) {
        const cntCountries = document.getElementById('tab-cnt-countries');
        const cntVisitors = document.getElementById('tab-cnt-visitors');
        const mapCountryCount = document.getElementById('map-country-count');
        const mapActiveCount = document.getElementById('map-active-count');
        if (cntCountries) cntCountries.textContent = data.visitorSummary.countries.length;
        if (cntVisitors) cntVisitors.textContent = data.visitorSummary.totalVisitors;
        if (mapCountryCount) mapCountryCount.textContent = data.visitorSummary.countries.length;
        if (mapActiveCount) mapActiveCount.textContent = data.visitorSummary.activeNow;

        const intelActive = document.getElementById('val-intel-active');
        const intelTotal = document.getElementById('val-intel-total');
        const intelReach = document.getElementById('val-intel-reach');
        const intelDevices = document.getElementById('val-intel-devices');
        if (intelActive) intelActive.innerHTML = '\u{1F7E2} ' + data.visitorSummary.activeNow + ' <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">online</span>';
        if (intelTotal) intelTotal.innerHTML = '\u{1F465} ' + data.visitorSummary.totalVisitors;
        if (intelReach) intelReach.innerHTML = '\u{1F30D} ' + data.visitorSummary.countries.length + ' <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">countries</span>';
        if (intelDevices && data.visitorSummary.devices) {
          intelDevices.innerHTML = '\u{1F4F1} ' + data.visitorSummary.devices.mobile + ' \u2022 \u{1F4BB} ' + data.visitorSummary.devices.desktop + ' \u2022 \u{1F4DF} ' + data.visitorSummary.devices.tablet;
        }

        // Update Leaflet Satellite Map Markers
        if (typeof updateMapMarkers === 'function') {
          updateMapMarkers(data.visitorSummary.countries, data.visitors);
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
  #__pf_loc_pill {
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: rgba(13, 17, 23, 0.94);
    border: 1px solid rgba(88, 166, 255, 0.45);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(88, 166, 255, 0.25);
    border-radius: 9999px;
    padding: 8px 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: #e6edf3;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    pointer-events: auto;
  }
  #__pf_loc_pill.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -20px);
  }
  #__pf_loc_dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #58a6ff;
    box-shadow: 0 0 8px #58a6ff;
    display: inline-block;
    animation: pfPulse 1.8s infinite;
  }
  @keyframes pfPulse {
    0% { transform: scale(0.9); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
    100% { transform: scale(0.9); opacity: 1; }
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

  // Location Active Notice & Precision GPS Telemetry
  try {
    const locPill = document.createElement('div');
    locPill.id = '__pf_loc_pill';
    locPill.innerHTML = '<span id="__pf_loc_dot"></span><span>\u{1F4CD} <strong>Location Radar Active:</strong> Calibrating live telemetry...</span>';
    document.body.appendChild(locPill);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);
          locPill.innerHTML = '<span id="__pf_loc_dot" style="background:#3fb950;box-shadow:0 0 8px #3fb950;"></span><span>\u{1F4CD} <strong>Location Active:</strong> Precision Satellite Fix (\xB1' + acc + 'm)</span>';
          fetch('/__peer_report_location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: lat, lng: lng, accuracy: acc, exact: true })
          }).catch(() => {});
          setTimeout(() => { locPill.classList.add('hidden'); }, 3500);
        },
        (err) => {
          locPill.innerHTML = '<span id="__pf_loc_dot" style="background:#58a6ff;"></span><span>\u{1F310} <strong>Location Active:</strong> Network Telemetry Connected</span>';
          setTimeout(() => { locPill.classList.add('hidden'); }, 3000);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setTimeout(() => { locPill.classList.add('hidden'); }, 2500);
    }
  } catch (e) {}
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
          const hubClientIp = (req.headers["cf-connecting-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || clientIp).replace(/^::ffff:/, "");
          const hubCfCountry = (req.headers["cf-ipcountry"] || req.headers["x-country-code"] || "").toUpperCase();
          const tunnel = this.telemetry.registerRemoteTunnel(data, hubClientIp, hubCfCountry);
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
          const hubClientIp = (req.headers["cf-connecting-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || clientIp).replace(/^::ffff:/, "");
          const hubCfCountry = (req.headers["cf-ipcountry"] || req.headers["x-country-code"] || "").toUpperCase();
          let tunnel = this.telemetry.updateRemoteTunnel(data, hubClientIp, hubCfCountry);
          if (!tunnel) {
            tunnel = this.telemetry.registerRemoteTunnel(data, hubClientIp, hubCfCountry);
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
    if (url.pathname === "/__peer_report_location" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (typeof data.lat === "number" && typeof data.lng === "number") {
            this.telemetry.updateVisitorGps(clientIp, data.lat, data.lng, data.accuracy);
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
    if (url.pathname === "/__peer_admin_api_test" && req.method === "POST") {
      if (!this.isAdminAuthorized(req)) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", () => {
        try {
          const { method = "GET", path: path3 = "/", headers = {}, body: reqBody = "" } = JSON.parse(body);
          const startTime = Date.now();
          const targetUrl = new URL(path3, `http://${this.targetHost}:${this.targetPort}`);
          const proxyReq = import_node_http.default.request(
            targetUrl,
            {
              method: method.toUpperCase(),
              headers: {
                ...headers,
                host: `${this.targetHost}:${this.targetPort}`
              }
            },
            (targetRes) => {
              let resData = "";
              targetRes.on("data", (c) => resData += c);
              targetRes.on("end", () => {
                const duration = Date.now() - startTime;
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    status: targetRes.statusCode || 200,
                    headers: targetRes.headers,
                    body: resData,
                    duration
                  })
                );
              });
            }
          );
          proxyReq.on("error", (err) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: 502,
                headers: {},
                body: `Connection failed: ${err.message}`,
                duration: Date.now() - startTime
              })
            );
          });
          if (reqBody && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
            proxyReq.write(typeof reqBody === "string" ? reqBody : JSON.stringify(reqBody));
          }
          proxyReq.end();
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    if (this.telemetry.isIpBlocked(clientIp)) {
      res.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html><html><head><title>403 Access Denied</title><style>body{background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:3rem;text-align:center;}h1{color:#f85149;}</style></head><body><h1>\u{1F6AB} 403 Access Denied</h1><p>Your IP address (<code>${escapeHtml2(clientIp)}</code>) has been blocked by the administrator.</p></body></html>`);
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
      case "toggle_block_ip":
        if (payload.ip) {
          const isBlocked = this.telemetry.toggleBlockVisitorIp(payload.ip);
          console.log(
            isBlocked ? import_picocolors.default.red(`  \u{1F6AB} [FIREWALL] Blocked IP: ${payload.ip}`) : import_picocolors.default.green(`  \u2714 [FIREWALL] Restored IP: ${payload.ip}`)
          );
        }
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

// src/banner.ts
var import_picocolors2 = __toESM(require("picocolors"), 1);
function printAdBanner(mode) {
  console.log(
    "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 ")) + "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557")) + "   " + import_picocolors2.default.white(import_picocolors2.default.bold("\u26A1 peer-port")) + " " + import_picocolors2.default.cyan("v1.0.5") + (mode ? " " + import_picocolors2.default.yellow(`(${mode})`) : "") + "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551")) + "   " + import_picocolors2.default.magenta("Crafted with \u2764\uFE0F  by Ankit Dhiman") + "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551")) + "   " + import_picocolors2.default.dim("Instant Global Public Tunnel & QA Suite") + "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D")) + "\n  " + import_picocolors2.default.cyan(import_picocolors2.default.bold("\u255A\u2550\u255D  \u255A\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u255D ")) + "\n"
  );
}

// src/tunnel.ts
var import_picocolors3 = __toESM(require("picocolors"), 1);
async function startGlobalTunnel(options) {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || "localhost";
  const lanIp = getLocalIpAddress();
  const lanUrl = `http://${lanIp}:${targetPort}`;
  printAdBanner();
  console.log(`  \u{1F3AF} Local App:        ${import_picocolors3.default.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  \u{1F4F6} Local LAN:        ${import_picocolors3.default.dim(lanUrl)}`);
  const pinGuard = new PinGuardProxy({
    targetPort,
    targetHost,
    pin: options.pin,
    adminPassword: options.adminPassword,
    enableFeedback: options.enableFeedback !== false
  });
  const tunnelPort = await pinGuard.start();
  if (options.pin) {
    console.log(`  \u{1F512} Visitor PIN:      ${import_picocolors3.default.bold(import_picocolors3.default.magenta(`ACTIVE (PIN: ${options.pin})`))}`);
  }
  const feedbackStatus = options.enableFeedback !== false ? import_picocolors3.default.green("ENABLED (Floating badge)") : import_picocolors3.default.dim("Disabled");
  console.log(`  \u{1F4CC} Visual Feedback:  ${feedbackStatus}`);
  console.log(import_picocolors3.default.yellow("  \u23F3 Generating secure public HTTPS link across the global internet..."));
  const { startTunnel } = await import("untun");
  const tunnel = await startTunnel({
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
          feedbacks: stats.feedbacks,
          visitors: stats.visitors,
          visitorSummary: stats.visitorSummary
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
  \u{1F310} ${import_picocolors3.default.bold(import_picocolors3.default.green("Public Website Link:"))} ${import_picocolors3.default.underline(import_picocolors3.default.bold(import_picocolors3.default.cyan(publicUrl)))}
`);
  if (!options.noQr) {
    console.log(import_picocolors3.default.dim("  Scan QR with your phone to open instantly:"));
    printQrCode(publicUrl);
    console.log("");
  }
  console.log(import_picocolors3.default.dim("  Press Ctrl+C to stop sharing."));
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
var import_picocolors4 = __toESM(require("picocolors"), 1);
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
      console.error(import_picocolors4.default.red(`\u274C [Proxy Error] ${req.method} ${url}: ${err.message}`));
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
    let statusColored = import_picocolors4.default.green(String(status));
    if (status >= 400 && status < 500) statusColored = import_picocolors4.default.yellow(String(status));
    if (status >= 500) statusColored = import_picocolors4.default.red(String(status));
    const methodColored = import_picocolors4.default.cyan(method.padEnd(6));
    const durationColored = import_picocolors4.default.dim(`${duration}ms`);
    console.log(`  ${import_picocolors4.default.magenta("\u21C4")} ${methodColored} ${import_picocolors4.default.white(url)} \u2192 ${statusColored} ${durationColored}`);
  }
};

// src/webrtc.ts
var import_werift = require("werift");
var import_picocolors5 = __toESM(require("picocolors"), 1);
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
        console.log(import_picocolors5.default.green("  \u2714 WebRTC PeerConnection established! Direct P2P tunnel active."));
        if (this.onConnected) this.onConnected();
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        console.log(import_picocolors5.default.yellow(`  \u26A0 WebRTC PeerConnection state: ${state}`));
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
        console.log(import_picocolors5.default.green("  \u2714 WebRTC DataChannel open! Ready for HTTP traffic."));
      } else if (state === "closed") {
        console.log(import_picocolors5.default.yellow("  \u26A0 WebRTC DataChannel closed."));
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
        console.error(import_picocolors5.default.red(`  \u274C Failed to parse incoming WebRTC message: ${err.message}`));
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
var import_picocolors6 = __toESM(require("picocolors"), 1);
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
      console.log(import_picocolors6.default.cyan("  \u{1F50C} Browser viewer connected for WebRTC handshake..."));
      try {
        const offerSdp = await this.bridge.createCompleteOffer();
        ws.send(JSON.stringify({ type: "offer", sdp: offerSdp }));
        ws.on("message", async (raw) => {
          try {
            const data = JSON.parse(raw.toString());
            if (data.type === "answer") {
              console.log(import_picocolors6.default.cyan("  \u{1F4E5} Received WebRTC SDP Answer from browser viewer!"));
              await this.bridge.handleAnswer(data.sdp);
              ws.send(JSON.stringify({ type: "handshake-success" }));
            }
          } catch (err) {
            console.error(import_picocolors6.default.red(`  \u274C Failed handling signaling message: ${err.message}`));
          }
        });
      } catch (err) {
        console.error(import_picocolors6.default.red(`  \u274C Failed during signaling handshake: ${err.message}`));
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
var import_picocolors7 = __toESM(require("picocolors"), 1);
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
  printAdBanner("P2P WebRTC");
  console.log(`  \u{1F3AF} Target App:      ${import_picocolors7.default.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  \u{1F4BB} Local Viewer:   ${import_picocolors7.default.underline(import_picocolors7.default.cyan(localUrl))}`);
  console.log(`  \u{1F4F1} Network / Phone: ${import_picocolors7.default.underline(import_picocolors7.default.bold(import_picocolors7.default.yellow(lanUrl)))}`);
  console.log(`  \u{1F512} Security:        Direct End-to-End P2P WebRTC DataChannel
`);
  if (!options.noQr) {
    console.log(import_picocolors7.default.dim("  Scan QR with your phone to open instantly:"));
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

// bin/peer-port.ts
var import_picocolors8 = __toESM(require("picocolors"), 1);
var program = new import_commander.Command();
program.name("peer-port").description("Instant Global Public Tunneling CLI - share localhost with automatic routing, optional PIN protection, and visual sticky-notes").version("1.0.5").argument("[port]", "Local port to expose (e.g. 3000, 5000)").option("-p, --port <number>", "Local target port").option("-h, --host <host>", "Local target host", "localhost").option("--admin-pass <password>", "Custom password to access the /__peer_admin dashboard").option("--pin <password>", "Optional password/PIN required for visitors to view your website").option("--no-feedback", "Disable the floating visual sticky-note feedback widget").option("--p2p", "Use direct WebRTC DataChannel P2P mode").option("--no-qr", "Disable terminal QR code rendering").action(async (portArg, options) => {
  const rawPort = portArg || options.port || "3000";
  const port = parseInt(rawPort, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    console.error(import_picocolors8.default.red(`\u274C Invalid port number: ${portArg}`));
    import_node_process4.default.exit(1);
  }
  try {
    if (options.p2p) {
      const tunnel = await startPeerTunnel({
        targetPort: port,
        targetHost: options.host,
        noQr: !options.qr
      });
      const cleanup = () => {
        console.log("\n" + import_picocolors8.default.yellow("\u{1F44B} Closing peer-port tunnel..."));
        tunnel.close();
        import_node_process4.default.exit(0);
      };
      import_node_process4.default.on("SIGINT", cleanup);
      import_node_process4.default.on("SIGTERM", cleanup);
    } else {
      const tunnel = await startGlobalTunnel({
        targetPort: port,
        targetHost: options.host,
        adminPassword: options.adminPass,
        pin: options.pin ? String(options.pin) : void 0,
        enableFeedback: options.feedback,
        noQr: !options.qr
      });
      const cleanup = async () => {
        console.log("\n" + import_picocolors8.default.yellow("\u{1F44B} Closing peer-port tunnel..."));
        await tunnel.close();
        import_node_process4.default.exit(0);
      };
      import_node_process4.default.on("SIGINT", cleanup);
      import_node_process4.default.on("SIGTERM", cleanup);
    }
  } catch (err) {
    console.error(import_picocolors8.default.red(`
\u274C Failed to start tunnel: ${err.message}`));
    import_node_process4.default.exit(1);
  }
});
program.parse(import_node_process4.default.argv);
//# sourceMappingURL=peer-port.cjs.map