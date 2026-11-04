import { printQrCode } from './qrcode.js';
import { getLocalIpAddress } from './network.js';
import { PinGuardProxy } from './guard.js';
import { printAdBanner } from './banner.js';
import pc from 'picocolors';

export interface GlobalTunnelOptions {
  targetPort: number;
  targetHost?: string;
  pin?: string;
  adminPassword?: string;
  enableFeedback?: boolean;
  noQr?: boolean;
}

export interface GlobalTunnelInstance {
  targetPort: number;
  publicUrl: string;
  lanUrl: string;
  adminUrl: string;
  adminPassword: string;
  pin?: string;
  close: () => Promise<void>;
}

export async function startGlobalTunnel(options: GlobalTunnelOptions): Promise<GlobalTunnelInstance> {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || 'localhost';
  const lanIp = getLocalIpAddress();
  const lanUrl = `http://${lanIp}:${targetPort}`;

  printAdBanner();
  console.log(`  🎯 Local App:        ${pc.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  📶 Local LAN:        ${pc.dim(lanUrl)}`);

  // Start the reverse proxy with telemetry & visual feedback support
  const pinGuard = new PinGuardProxy({
    targetPort,
    targetHost,
    pin: options.pin,
    adminPassword: options.adminPassword,
    enableFeedback: options.enableFeedback !== false,
  });
  const tunnelPort = await pinGuard.start();

  if (options.pin) {
    console.log(`  🔒 Visitor PIN:      ${pc.bold(pc.magenta(`ACTIVE (PIN: ${options.pin})`))}`);
  }

  const feedbackStatus = options.enableFeedback !== false ? pc.green('ENABLED (Floating badge)') : pc.dim('Disabled');
  console.log(`  📌 Visual Feedback:  ${feedbackStatus}`);

  console.log(pc.yellow('  ⏳ Generating secure public HTTPS link across the global internet...'));

  // Use dynamic import so it works in both ESM and CJS environments
  const { startTunnel } = await import('untun');

  const tunnel = await startTunnel({
    port: tunnelPort,
    hostname: 'localhost',
    acceptCloudflareNotice: true,
  });

  if (!tunnel) {
    pinGuard.close();
    throw new Error('Failed to initialize Cloudflare tunnel process.');
  }

  const publicUrl = await tunnel.getURL();
  pinGuard.telemetry.setPublicUrl(publicUrl);
  const localAdminUrl = `http://localhost:${tunnelPort}/__peer_admin`;

  const DEFAULT_HUB_URL = 'https://tunneler-admin.onrender.com';
  const hubUrl = (process.env.HUB_URL || DEFAULT_HUB_URL).replace(/\/$/, '');
  const isRender = Boolean(process.env.RENDER);

  let heartbeatInterval: NodeJS.Timeout | null = null;
  const tunnelSessionId = 'tun_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  if (!isRender && hubUrl) {
    const registerPayload = {
      id: tunnelSessionId,
      publicUrl,
      target: `http://${targetHost}:${targetPort}`,
      startedAt: Date.now(),
    };

    fetch(`${hubUrl}/__peer_hub_register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    }).catch(() => {});

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
          visitorSummary: stats.visitorSummary,
        };

        const res = await fetch(`${hubUrl}/__peer_hub_heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data: any = await res.json();
          if (typeof data.isPaused === 'boolean') {
            pinGuard.telemetry.isPaused = data.isPaused;
          }
          if (Array.isArray(data.disabledPages)) {
            pinGuard.telemetry.disabledPages = new Set(data.disabledPages);
          }
        }
      } catch {
        // tolerate hub offline / network jitter
      }
    }, 3000);

    if (typeof heartbeatInterval.unref === 'function') {
      heartbeatInterval.unref();
    }
  }

  console.log(`\n  🌐 ${pc.bold(pc.green('Public Website Link:'))} ${pc.underline(pc.bold(pc.cyan(publicUrl)))}\n`);

  if (!options.noQr) {
    console.log(pc.dim('  Scan QR with your phone to open instantly:'));
    printQrCode(publicUrl);
    console.log('');
  }

  console.log(pc.dim('  Press Ctrl+C to stop sharing.'));

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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: tunnelSessionId }),
          });
        } catch {}
      }
      pinGuard.close();
      await tunnel.close();
    },
  };
}
