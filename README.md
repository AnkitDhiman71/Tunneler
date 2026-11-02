# ⚡ peer-port

> **Zero-config Localhost-to-Global Tunneling CLI with Executive Admin Center, Live Website Preview, Emergency Kill Switch, and Visual Sticky-Note Bug Reporter.**

Turn any local port (`localhost:3000`, `localhost:5000`) into an instant, secure **Global Public HTTPS URL** (`https://*.trycloudflare.com`) with zero accounts, live telemetry, and an in-browser visual bug reporter.

---

## 🌟 What Makes `peer-port` Unique?

| Feature | Description |
|---|---|
| 🌐 **Instant Global HTTPS Link** | Reachable anywhere in the world on any network (Wi-Fi, 4G/5G, different city) with automatic routing (`/`, `/home`, `/api/*`). |
| 🛡️ **Executive Admin Center (`/__peer_admin`)** | Password-protected live management dashboard for real-time telemetry, visitors, and active requests. |
| 👁️ **In-Dashboard Live Preview** | Responsive live website viewport preview inside the Admin HUD with Desktop, Tablet, and Mobile switches. |
| 🛑 **Emergency Kill Switch** | 1-click master kill switch to instantly pause external access and return a 503 Maintenance screen. |
| 🚫 **Page-Level Route Disabling** | Selectively disable specific pages (e.g. `/checkout`) with a 403 Forbidden screen while keeping the rest of the site open. |
| 📌 **Visual Bug Reporter & Sticky Notes** | Injected floating badge: friends/clients click any button or image and type feedback. Pings your terminal instantly with element selector and device screen size! |
| 🔒 **Optional Visitor PIN Lock** | Run with `--pin <password>` to show a sleek frosted-glass lockscreen to unauthorized visitors. |
| 📱 **Terminal QR Code** | Instant high-contrast ASCII QR code to scan with any smartphone camera. |

---

## 🚀 Quick Start

Run it directly using `npx`:

```bash
# Share local port 3000 globally
npx peer-port 3000

# With visitor PIN protection (e.g. 1324)
npx peer-port 3000 --pin 1324

# With custom admin dashboard password
npx peer-port 3000 --admin-pass mySecret123
```

Or install globally:

```bash
npm install -g peer-port
peer-port 3000
```

---

## 💻 Terminal Output

```text
⚡ peer-port — Instant Global Public Tunnel & QA Suite

  🎯 Local App:        http://localhost:3000
  📶 Local LAN:        http://192.168.1.45:3000
  🔑 Admin Password:   admin_Ankit@1320  (Required to access Admin Center)
  🔓 Visitor Access:   Open (Anyone with the link can browse)
  📌 Visual Feedback:  ENABLED (Floating badge)
  ⏳ Generating secure public HTTPS link across the global internet...

  🌐 Public Website Link: https://wild-ocean-42.trycloudflare.com

  📊 Executive Admin HUD: http://localhost:52419/__peer_admin
     (Remote: https://wild-ocean-42.trycloudflare.com/__peer_admin)

  Scan QR with your phone to open instantly:
  [ ASCII QR CODE ]

  Press Ctrl+C to stop sharing.
```

---

## 🛡️ Executive Admin Center (`/__peer_admin`)

Protected by your admin password (default: `admin_Ankit@1320` or `--admin-pass <custom>`):

1. **🌐 Hosted Websites & Links:**
   - See your active public link and local destination.
   - **👁️ Live Preview:** Test the responsive layout (Desktop, Tablet, Mobile) without leaving the dashboard.
   - **🛑 Kill Switch:** Immediately freeze external traffic with a 503 screen if you need to debug or pause access.
   - **📊 See Requests & Statistics:** Open detailed route-by-route performance telemetry.
2. **Hierarchical Request Tree & Sub-Assets:**
   - Primary route visits (e.g. `GET /home`, `GET /checkout`) expand to show all child asset requests (CSS, JS, images, API calls).
   - **🚫 Disable Page:** Disable specific routes with 1 click to test 403 Forbidden handling.
3. **📌 Bug Reports & Sticky Notes Tab:**
   - Review and resolve all client notes submitted via the website.

---

## 📌 Visual Sticky-Note & Bug Reporter

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

## 🔒 Optional Visitor PIN Lockscreen (`--pin`)

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
| `--admin-pass <password>` | Custom password for the `/__peer_admin` dashboard | `admin_Ankit@1320` |
| `--pin <password>` | Protect website with a PIN or password for visitors | `None` |
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

---

## 📄 License

MIT © 2026 Ankit Dhiman
