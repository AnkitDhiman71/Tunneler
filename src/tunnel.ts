import { printQrCode } from './qrcode.js';
import { getLocalIpAddress } from './network.js';
import { PinGuardProxy } from './guard.js';
import pc from 'picocolors';

export interface GlobalTunnelOptions {
  targetPort: number;
  targetHost?: string;
  pin?: string;
  enableFeedback?: boolean;
  noQr?: boolean;
}

export interface GlobalTunnelInstance {
  targetPort: number;
  publicUrl: string;
  lanUrl: string;
  adminUrl: string;
  pin?: string;
  close: () => Promise<void>;
}

export async function startGlobalTunnel(options: GlobalTunnelOptions): Promise<GlobalTunnelInstance> {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || 'localhost';
  const lanIp = getLocalIpAddress();
  const lanUrl = `http://${lanIp}:${targetPort}`;

  console.log('\n' + pc.bold(pc.cyan('⚡ peer-port — Instant Global Public Tunnel & QA Suite')) + '\n');
  console.log(`  🎯 Local App:        ${pc.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  📶 Local LAN:        ${pc.dim(lanUrl)}`);

  // Start the reverse proxy with telemetry & visual feedback support
  const pinGuard = new PinGuardProxy({
    targetPort,
    targetHost,
    pin: options.pin,
    enableFeedback: options.enableFeedback !== false,
  });
  const tunnelPort = await pinGuard.start();

  if (options.pin) {
    console.log(`  🔒 PIN Protection:   ${pc.bold(pc.yellow(`ACTIVE (PIN: ${options.pin})`))}`);
  } else {
    console.log(`  🔓 Access Mode:      ${pc.dim('Open (No PIN required)')}`);
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
  const localAdminUrl = `http://localhost:${tunnelPort}/__peer_admin`;
  const publicAdminUrl = `${publicUrl}/__peer_admin`;

  console.log(`\n  🌐 ${pc.bold(pc.green('Public Global Link:'))} ${pc.underline(pc.bold(pc.cyan(publicUrl)))}\n`);
  console.log(`  📊 ${pc.bold(pc.magenta('Admin HUD:'))}         ${pc.underline(pc.magenta(localAdminUrl))}`);
  console.log(pc.dim(`     (Monitor active requests, latency, views & client bug reports in real-time)\n`));

  if (options.pin) {
    console.log(pc.white(`  🔒 Visitors must enter PIN ${pc.bold(pc.yellow(options.pin))} to view your website.`));
  } else {
    console.log(pc.white('  Anyone in the world on ANY network, cellular 4G/5G, or another city'));
    console.log(pc.white(`  can access your website, navigate routes (${pc.cyan('/home')}, ${pc.cyan('/login')}), and APIs.`));
  }

  if (options.enableFeedback !== false) {
    console.log(pc.dim('  Clients can click any element on the page to drop visual sticky-notes & feedback!'));
  }
  console.log('');

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
    pin: options.pin,
    close: async () => {
      pinGuard.close();
      await tunnel.close();
    },
  };
}
