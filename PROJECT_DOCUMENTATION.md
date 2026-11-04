# ⚡ peer-port — Complete Architecture & Technology Reference

**Author:** Ankit Dhiman  
**Repository:** [github.com/AnkitDhiman71/Tunneler](https://github.com/AnkitDhiman71/Tunneler)  
**Package:** `peer-port` (npm)

---

## 1. Project Purpose & Executive Overview

### What is `peer-port` created for?
When developers build web applications locally (e.g. a MERN stack app running React on port 5173 and Express on port 5000), testing with remote clients, colleagues, or mobile devices usually requires tedious network configuration, router port forwarding, or expensive third-party subscriptions with bandwidth limits.

`peer-port` was engineered to solve this with a single command:
1. **Instant Global Public URLs:** Exposes any local port to the public internet using high-speed encrypted tunnels without configuring router ports or firewalls.
2. **Built-in Security & Access Control:** Protects in-development websites with an optional visitor PIN lockscreen.
3. **Interactive Visual Feedback Suite:** Injects an interactive sticky-note widget into HTML pages so remote testers can click anywhere on the page, leave comments, and report bugs visually.
4. **Centralized Executive Control Portal:** Gives project owners a central cloud command center (`tunneler-admin.onrender.com`) to monitor connected tunnels, view real-time request trees, inspect latencies, live-preview remote sites in desktop/mobile viewports, and remotely pause access via a master kill-switch.

---

## 2. Core Architecture & Request Flow

```
[Remote Visitor Browser / Phone]
              │
              │ HTTPS Request
              ▼
┌──────────────────────────────────────────────────┐
│ Cloudflare Anycast Edge Network                  │
│ (Global CDN, SSL Termination, DDoS Mitigation)   │
└─────────────────────┬────────────────────────────┘
                      │ Multiplexed HTTP/2 Quick Tunnel
                      ▼
┌──────────────────────────────────────────────────┐
│ Local Host Machine (Developer Laptop)            │
│                                                  │
│   ┌──────────────────────────────────────────┐   │
│   │ cloudflared / untun Tunnel Process       │   │
│   └─────────────────┬────────────────────────┘   │
│                     │ Forward to Proxy Port      │
│                     ▼                            │
│   ┌──────────────────────────────────────────┐   │
│   │ PinGuardProxy (Node.js Reverse Proxy)    │   │
│   │ - Checks Visitor PIN Cookie              │   │
│   │ - Evaluates Page Blocklist               │   │
│   │ - Evaluates Master Kill-Switch (503)     │   │
│   │ - Injects Visual Feedback Widget Script  │   │
│   │ - Tracks Hierarchical Telemetry & Latency│   │
│   └──────────────┬───────────────────┬───────┘   │
│                  │                   │           │
│        (Proxy)   │                   │ (3s Sync) │
│                  ▼                   ▼           │
│   ┌─────────────────────┐   ┌─────────────────┐  │
│   │ Target App Server   │   │ Central Render  │  │
│   │ (Vite: 5173 /       │   │ Admin Portal    │  │
│   │  Express: 5000)     │   │ (Cloud Hub)     │  │
│   └─────────────────────┘   └─────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 3. Technologies & Libraries Used

| Technology / Library | Purpose & Implementation Details |
| :--- | :--- |
| **Node.js (v18+)** | High-performance asynchronous runtime utilizing non-blocking event loops, streams, and buffer manipulation. |
| **TypeScript (v5.7)** | Provides strict type safety across all proxy states, telemetry models, and WebRTC protocols. |
| **untun (Cloudflare Quick Tunnels)** | Manages automated background binary acquisition and lifecycle of Cloudflare `cloudflared` quick tunnels for instantaneous global HTTPS routing. |
| **werift (Pure Node.js WebRTC)** | Pure TypeScript implementation of WebRTC (RFC 8829). Implements `RTCPeerConnection`, `RTCDataChannel`, ICE candidate gathering, DTLS handshake, and SCTP encapsulation for zero-proxy direct browser-to-node P2P tunneling. |
| **ws (WebSocket Server)** | High-speed RFC 6455 WebSocket engine used in P2P mode for SDP (Session Description Protocol) offer/answer and ICE candidate exchange between peers. |
| **Commander.js** | Enterprise CLI argument and flag parser handling positional ports (`5173`), options (`-p`, `--pin`, `--admin-pass`), and interactive help menus. |
| **tsup** | Blazing-fast zero-config bundler powered by esbuild, compiling TypeScript into dual ESM and CJS distributions with embedded `.d.ts` type declarations and source maps. |
| **Vitest** | Next-generation testing framework running unit and integration tests across proxy forwarding, telemetry grouping, and WebRTC bridge components. |
| **Picocolors** | Tiny, memory-efficient ANSI color formatter for clean developer-facing terminal dashboards and status indicators. |
| **qrcode-terminal** | Compact UTF-8 ASCII QR code renderer allowing developers to instantly scan their public URL with a mobile camera. |

---

## 4. In-Depth Breakdown of Built-In Methods & Components

### A. WebRTC Implementation (`src/webrtc.ts` & `src/p2p.ts`)
- **Library Used:** `werift`
- **Why `werift` instead of `node-webrtc` / `wrtc`?**
  Native C++ WebRTC bindings (`wrtc`) frequently break across modern Node versions and operating systems. `werift` is 100% pure TypeScript/JavaScript and runs seamlessly on Windows, macOS, and Linux without native compilers.
- **Methods & Concepts Used:**
  - `new RTCPeerConnection(configuration)`: Initializes the WebRTC peer with STUN servers (`stun:stun.l.google.com:19302`).
  - `peerConnection.createDataChannel('http-tunnel', { ordered: true })`: Creates an ordered, reliable SCTP data channel for bi-directional binary HTTP data transfer.
  - `peerConnection.createOffer()` & `peerConnection.setLocalDescription()`: Generates standard SDP payloads containing video/audio/data capabilities and network transport fingerprints.
  - **32KB Chunk Fragmentation (`src/protocol.ts`):** WebRTC DataChannels have a safe packet transmission limit of ~64KB. `peer-port` divides large HTTP responses (HTML, CSS, images, video) into structured 32KB binary frames with chunk indices and recombines them inside the visitor's browser ServiceWorker.

### B. Dynamic Reverse Proxy & In-Flight Injection (`src/guard.ts`)
- **Native Modules:** `node:http`, `node:crypto`, `node:buffer`, `node:url`
- **Streaming Pipeline:** Requests are streamed using `.pipe(proxyReq)` without buffering entire request bodies in memory, guaranteeing minimal RAM usage.
- **HTML Chunk Injection:** For `text/html` responses, the proxy intercepts the stream, decodes chunks via `Buffer.concat`, and injects the client-side Feedback Widget script right before `</body>`.
- **Session Authentication:**
  - Generates cryptographic tokens using `crypto.randomBytes(24).toString('hex')`.
  - Sets `HttpOnly; SameSite=Lax` cookies (`peer_port_auth` for visitors and `peer_admin_auth` for administrators).

### C. Hierarchical Request Telemetry (`src/admin.ts`)
- **Smart Grouping Algorithm:** Rather than showing thousands of disorganized asset requests (`.js`, `.css`, `.png`), `peer-port` detects top-level document page loads (e.g. `/` or `/dashboard`) and nests all subsequent sub-asset requests triggered within that page load underneath the parent row.
- **Latency & Performance Metrics:** Accurately measures round-trip time (`startTime` to `res.on('finish')`) and computes real-time rolling average latency and HTTP status code distribution (2xx, 3xx, 4xx, 5xx).

### D. Central Admin Hub & Multi-Tunnel Synchronization (`src/tunnel.ts`)
- **Heartbeat Protocol:** Client CLI sessions send recurring HTTP POST heartbeats (`/__peer_hub_heartbeat`) every 3 seconds to the central management node (`tunneler-admin.onrender.com`).
- **Bi-directional Sync:** The heartbeat response delivers active administrative state (e.g. `isPaused: true` or `disabledPages: ['/checkout']`) back to the client CLI, enforcing remote commands without requiring incoming firewall ports.

### E. Real-Time Global Visitor Radar (`src/visitor-intel.ts` & `src/admin-extensions.ts`)
- **Interactive SVG Vector Map:** Uses equirectangular coordinate mapping (`x = (lng + 180) * (800 / 360)`, `y = (90 - lat) * (400 / 180)`) with glowing cyan radar pulse animations directly on Render without external map APIs.
- **Edge Geolocation:** Resolves visitor geographic country and coordinates from Cloudflare edge headers (`cf-ipcountry`).

### F. Device & Session Intelligence with IP Firewall
- **User-Agent Fingerprinting:** Extracts exact OS (Windows 11/10, macOS, iOS, Android, Linux), browser engine (Chrome, Safari, Firefox, Edge, Opera), and device category (Desktop, Mobile, Tablet, Bot).
- **Session Timeline & Route Tracking:** Tracks first seen, last active timestamp, session duration, and unique visited routes per user.
- **1-Click IP Firewall:** Blocks abusive visitors or web scrapers with an instant 403 Access Denied gatekeeper.

### G. Embedded Live API Laboratory & Security Posture Scorecard
- **In-Browser REST Console:** Postman-style interactive testing console embedded directly in the admin dashboard allowing admins to test any route (`GET`, `POST`, `PUT`, `DELETE`), configure custom headers, and send JSON bodies with live status, latency, and formatted JSON output.
- **cURL & Fetch Code Generator:** Instant 1-click command generation to replay any request in terminal or frontend code.
- **Security Audit Engine:** Live security posture scorecard assessing TLS 1.3 encryption, cryptographic cookie flags, PIN gatekeeper status, and proxy hop integrity.


