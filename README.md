# ⚡ peer-port

> **Zero-config Localhost-to-Global Tunneling CLI with Live Admin HUD & Visual Sticky-Note Bug Reporter.**

Turn any local port (`localhost:3000`, `localhost:5000`) into an instant, secure **Global Public HTTPS URL** (`https://*.trycloudflare.com`) with zero accounts, live telemetry, and an in-browser visual bug reporter.

---

## 🌟 What Makes `peer-port` Unique?

| Feature | Description |
|---|---|
| 🌐 **Instant Global HTTPS Link** | Reachable anywhere in the world on any network (Wi-Fi, 4G/5G, different city). |
| 🔒 **Optional PIN Lock** | Run with `--pin 1324` to show a sleek frosted-glass lockscreen to unauthorized visitors. |
| 📊 **Live Admin HUD (`/__peer_admin`)** | Track active requests, total visitors, response times, and live traffic stream in real-time. |
| 📌 **Visual Bug Reporter & Sticky Notes** | Injected floating badge: friends/clients click any button or image and type feedback. Pings your terminal instantly with element selector and device screen size! |
| 🛣️ **Automatic Route Handling** | Deep routes (`/`, `/home`, `/api/users`), React Router SPA, cookies, forms, and WebSockets work natively. |
| 📱 **Terminal QR Code** | Instant high-contrast ASCII QR code to scan with any smartphone camera. |

---

## 🚀 Quick Start

Run it directly using `npx`:

```bash
# Open access
npx peer-port 3000

# With PIN protection (e.g. 1324)
npx peer-port 3000 --pin 1324
```

Or install globally:

```bash
npm install -g peer-port
peer-port 3000 --pin 1324
```

---

## 💻 Terminal Output

```text
⚡ peer-port — Instant Global Public Tunnel & QA Suite

  🎯 Local App:        http://localhost:3000
  📶 Local LAN:        http://192.168.1.45:3000
  🔒 PIN Protection:   ACTIVE (PIN: 1324)
  📌 Visual Feedback:  ENABLED (Floating badge)
  ⏳ Generating secure public HTTPS link across the global internet...

  🌐 Public Global Link: https://wild-ocean-42.trycloudflare.com
  📊 Admin HUD:         http://localhost:52419/__peer_admin
     (Monitor active requests, latency, views & client bug reports in real-time)

  🔒 Visitors must enter PIN 1324 to view your website.
  Clients can click any element on the page to drop visual sticky-notes & feedback!

  Scan QR with your phone to open instantly:
  [ ASCII QR CODE ]

  Press Ctrl+C to stop sharing.
```

---

## 📌 Feature 1: Visual Sticky-Note & Bug Reporter

When clients or non-technical friends view your site, they often give vague feedback like *"The layout looks broken on my phone"*.

**`peer-port` automatically injects a floating `📌 Drop Comment` pill:**
1. Your client clicks **`📌 Drop Comment`** on their phone or browser.
2. An element inspector activates: clicking any element (e.g. a navbar, button, image) opens a sleek note box.
3. They type: *"Change this button to dark blue, text is overlapping"*.
4. **Your terminal instantly pings:**
   ```text
   📌 NEW VISUAL FEEDBACK on /home
     💬 "Change this button to dark blue, text is overlapping"
     🎯 Element: button.btn-primary ("Sign In")
     📱 Device:  393x852 (iPhone 14)  •  7:35:12 pm
   ```
5. All notes are saved and cataloged in your **Admin HUD**!

*(To disable the widget, pass `--no-feedback`)*

---

## 📊 Feature 2: Live Admin HUD (`/__peer_admin`)

Open `/__peer_admin` (or the local link printed in your terminal) to monitor everything happening in real-time:
* **Active Requests:** How many requests are in flight right now.
* **Total Requests & Unique Visitors:** Live count of visitors and views.
* **Average Latency:** Millisecond response time tracker.
* **Live Request Stream:** Real-time log table showing HTTP methods, paths, status codes, and timings.
* **Sticky-Notes Feed:** Visual list of all submitted client comments with element tags.

---

## 🔒 Feature 3: PIN Lockscreen (`--pin`)

Keep your preview private:
* Run `peer-port 3000 --pin 1324`.
* When anyone visits `https://*.trycloudflare.com`, they see a glassmorphism PIN screen.
* Once the PIN is verified, an HTTP-only session cookie is set and they are redirected to their requested route.

---

## 💻 CLI Flags & Options

```bash
peer-port [port] [options]
```

| Flag | Description | Default |
|---|---|---|
| `[port]` | The local port to expose | `3000` |
| `-p, --port <number>` | Target local port | `3000` |
| `-h, --host <host>` | Target local host | `localhost` |
| `--pin <password>` | Protect link with a PIN or password | `None` |
| `--no-feedback` | Disable the floating visual feedback widget | `false` |
| `--p2p` | Switch to direct WebRTC P2P DataChannel mode | `false` |
| `--no-qr` | Disable terminal QR code output | `false` |
| `-V, --version` | Output version number | |
| `--help` | Display help screen | |

---

## 🧪 Testing & Build

```bash
# Run unit & integration tests
npm test

# Build ESM + CJS + DTS bundles
npm run build
```

---

## 🚢 Publishing to NPM

1. **Log in to your NPM account:**
   ```bash
   npm login
   ```
2. **Publish to the public registry:**
   ```bash
   npm publish --access public
   ```

*(If the package name `peer-port` is taken on the public registry, update `"name": "@your-username/peer-port"` in `package.json` before publishing.)*

---

## 📄 License

MIT © 2026
