import type { VisitorProfile } from './visitor-intel.js';

export function renderWorldMapStyles(): string {
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

export function renderSatelliteMapContainer(summary: { countries: any[]; activeNow: number }): string {
  return `
    <div class="map-container">
      <div class="map-header">
        <h3>🛰️ Real-Time Global Visitor Radar</h3>
        <div class="map-controls-bar">
          <div class="map-layer-selector">
            <button class="map-layer-btn active" id="btn-layer-sat" onclick="switchMapLayer('satellite')">🛰️ Satellite</button>
            <button class="map-layer-btn" id="btn-layer-dark" onclick="switchMapLayer('dark')">🌌 Cyber Dark</button>
            <button class="map-layer-btn" id="btn-layer-streets" onclick="switchMapLayer('streets')">🗺️ Streets</button>
          </div>
          <button class="map-reset-btn" onclick="resetMapView()" title="Reset to global overview">🌍 Overview</button>
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

export function renderVectorWorldMapSvg(countries: Array<{ code: string; name: string; flag: string; requests: number; lat: number; lng: number }>): string {
  // Equirectangular projection mapping: width=800, height=400
  // x = (lng + 180) * (800 / 360)
  // y = (90 - lat) * (400 / 180)
  const mapWidth = 800;
  const mapHeight = 400;

  const dotsSvg = countries
    .map((c) => {
      const x = Math.round((c.lng + 180) * (mapWidth / 360));
      const y = Math.round((90 - c.lat) * (mapHeight / 180));
      return `
        <g class="radar-dot" data-name="${c.name}" data-flag="${c.flag}" data-reqs="${c.requests}" transform="translate(${x}, ${y})">
          <circle class="radar-ring" cx="0" cy="0" r="10" fill="none" stroke="#58a6ff" opacity="0.8" />
          <circle cx="0" cy="0" r="5" fill="#58a6ff" stroke="#fff" stroke-width="1.5" />
          <circle cx="0" cy="0" r="2" fill="#fff" />
        </g>
      `;
    })
    .join('');

  return `
    <svg class="world-svg" viewBox="0 0 ${mapWidth} ${mapHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1f2937" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#0d1117" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Background Grid -->
      <rect width="100%" height="100%" fill="#0d1117" />
      <rect width="100%" height="100%" fill="url(#gridGlow)" />
      
      <!-- Coordinate Latitude/Longitude Grid Lines -->
      <g stroke="rgba(255,255,255,0.04)" stroke-width="0.75" stroke-dasharray="3 3">
        <line x1="0" y1="100" x2="800" y2="100" />
        <line x1="0" y1="200" x2="800" y2="200" />
        <line x1="0" y1="300" x2="800" y2="300" />
        <line x1="200" y1="0" x2="200" y2="400" />
        <line x1="400" y1="0" x2="400" y2="400" />
        <line x1="600" y1="0" x2="600" y2="400" />
      </g>

      <!-- Continents Silhouette Paths (Ultra-Clean Vector Representation) -->
      <g fill="#1b2430" stroke="#253243" stroke-width="1" opacity="0.85">
        <!-- North America -->
        <path d="M 80 60 Q 120 40 180 50 Q 220 70 240 110 Q 220 160 170 170 Q 140 180 130 200 Q 110 230 110 210 Q 90 170 80 140 Q 60 100 80 60 Z" />
        <!-- South America -->
        <path d="M 190 220 Q 240 230 250 280 Q 240 330 210 370 Q 190 350 180 300 Q 170 260 190 220 Z" />
        <!-- Europe -->
        <path d="M 370 70 Q 430 60 460 90 Q 450 130 410 140 Q 380 130 360 110 Q 360 80 370 70 Z" />
        <!-- Africa -->
        <path d="M 360 150 Q 430 140 460 180 Q 470 240 430 310 Q 390 320 370 270 Q 340 230 340 190 Z" />
        <!-- Asia -->
        <path d="M 450 60 Q 560 40 680 70 Q 720 120 690 180 Q 640 220 580 200 Q 520 190 490 140 Q 460 110 450 60 Z" />
        <!-- Australia -->
        <path d="M 640 270 Q 720 260 740 300 Q 730 340 670 340 Q 630 320 640 270 Z" />
      </g>

      <!-- Active Visitor Radar Dots -->
      <g id="map-radar-group">
        ${dotsSvg}
      </g>
    </svg>
  `;
}

export function renderVisitorIntelligencePanel(
  summary: {
    totalVisitors: number;
    activeNow: number;
    blockedCount: number;
    countries: Array<{ code: string; name: string; flag: string; requests: number; lat: number; lng: number }>;
    devices: { desktop: number; mobile: number; tablet: number };
  },
  visitors: VisitorProfile[]
): string {
  return `
    <div class="panel" id="panel-visitors" style="display: none;">
      <div class="panel-header">
        <h2>👥 Real-Time Visitor Intelligence & Device Inspector</h2>
        <p>Inspect incoming visitor traffic, device fingerprints, visited pages, and manage IP firewall rules.</p>
      </div>

      <!-- INTEL METRIC CARDS -->
      <div class="intel-grid">
        <div class="intel-card">
          <div class="title">Active Visitors Now</div>
          <div class="val" id="val-intel-active" style="color: #3fb950;">🟢 ${summary.activeNow} <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">online</span></div>
        </div>
        <div class="intel-card">
          <div class="title">Total Distinct Visitors</div>
          <div class="val" id="val-intel-total">👥 ${summary.totalVisitors}</div>
        </div>
        <div class="intel-card">
          <div class="title">Global Geographic Reach</div>
          <div class="val" id="val-intel-reach">🌍 ${summary.countries.length} <span style="font-size: 0.85rem; font-weight: normal; color: #8b949e;">countries</span></div>
        </div>
        <div class="intel-card">
          <div class="title">Mobile vs Desktop</div>
          <div class="val" id="val-intel-devices" style="font-size: 1.1rem; color: #58a6ff;">
            📱 ${summary.devices.mobile} • 💻 ${summary.devices.desktop} • 📟 ${summary.devices.tablet}
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
          ${
            visitors.length === 0
              ? '<tr><td colspan="8" style="text-align: center; color: #8b949e; padding: 2rem;">No visitors recorded yet. Open your public tunnel link to see your session appear here live!</td></tr>'
              : visitors
                  .map(
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
                  ${v.deviceType === 'Mobile' ? '📱' : v.deviceType === 'Tablet' ? '📟' : '💻'} ${v.os}
                </span>
              </td>
              <td style="color: #e6edf3;">
                ${v.browser}
              </td>
              <td>
                ${v.visitedRoutes.map((r) => `<span class="route-pill">${r}</span>`).join('')}
              </td>
              <td>
                <strong>${v.requestCount}</strong> <span style="font-size: 0.75rem; color: #8b949e;">(${v.avgLatency}ms)</span>
              </td>
              <td>
                ${Date.now() - v.lastActive < 120000 ? '<span class="status-badge-live">🟢 Online</span>' : '<span style="color: #8b949e; font-size: 0.8rem;">⚪ Idle</span>'}
              </td>
              <td>
                <button 
                  onclick="toggleBlockVisitorIp('${v.ip}')"
                  style="background: ${v.isBlocked ? '#238636' : '#da3633'}; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                  ${v.isBlocked ? '✅ Unblock IP' : '🚫 Ban IP'}
                </button>
              </td>
            </tr>
          `
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

export function renderApiLaboratoryPanel(): string {
  return `
    <div class="panel" id="panel-apilab" style="display: none;">
      <div class="panel-header">
        <h2>⚡ Live API Laboratory, Traffic Replayer & Security Posture</h2>
        <p>Replay captured client API requests, test endpoints in real time, generate cURL commands, and audit tunnel security.</p>
      </div>

      <!-- REST API PLAYGROUND -->
      <div class="api-lab-card">
        <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #58a6ff; display: flex; align-items: center; gap: 8px;">
          🧪 Embedded REST API Console
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
            ▶ Send Request
          </button>
          <button class="btn-copy" onclick="copyApiAsCurl()" title="Copy as cURL command">
            📋 Copy cURL
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
            <button class="btn-copy" onclick="copyText(document.getElementById('api-res-body').innerText)">📋 Copy Response</button>
          </div>
          <pre id="api-res-body" class="response-body-pre"></pre>
        </div>
      </div>

      <!-- 1-CLICK TUNNEL SECURITY & PERFORMANCE AUDIT -->
      <div class="api-lab-card">
        <h3 style="font-size: 1rem; color: #3fb950; display: flex; align-items: center; gap: 8px;">
          🛡️ Live Tunnel Security & Posture Scorecard
        </h3>
        <div class="audit-grid">
          <div class="audit-item">
            <div class="status" style="color: #3fb950;">🔒 Edge TLS 1.3 Encryption</div>
            <div class="desc">Active Cloudflare Anycast edge with strict HTTPS termination and encrypted packet forwarding.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #58a6ff;">🛡️ Gatekeeper Authentication</div>
            <div class="desc">Cookie-based cryptographic token verification prevents unauthorized direct access.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #3fb950;">⚡ Rolling Latency Rating: A+</div>
            <div class="desc">Sub-40ms loopback reverse proxy streaming with zero in-memory payload buffering.</div>
          </div>
          <div class="audit-item">
            <div class="status" style="color: #d29922;">🚫 Page-Level Quarantine Engine</div>
            <div class="desc">Granular route-level blocklist active. Sensitive endpoints can be frozen without dropping the tunnel.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

