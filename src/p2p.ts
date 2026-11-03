import { LocalHttpProxy } from './proxy.js';
import { WebRtcBridge } from './webrtc.js';
import { SignalingServer } from './signaling.js';
import { getLocalIpAddress } from './network.js';
import { printQrCode } from './qrcode.js';
import { printAdBanner } from './banner.js';
import pc from 'picocolors';

export interface TunnelOptions {
  targetPort: number;
  targetHost?: string;
  signalingPort?: number;
  noQr?: boolean;
}

export interface TunnelInstance {
  targetPort: number;
  signalingPort: number;
  localUrl: string;
  lanUrl: string;
  close: () => void;
}

export async function startPeerTunnel(options: TunnelOptions): Promise<TunnelInstance> {
  const targetPort = options.targetPort;
  const targetHost = options.targetHost || 'localhost';

  const proxy = new LocalHttpProxy({
    targetPort,
    targetHost,
  });

  const bridge = new WebRtcBridge({
    proxy,
  });

  const signaling = new SignalingServer({
    bridge,
    port: options.signalingPort || 4040,
  });

  const actualSignalingPort = await signaling.start();
  const lanIp = getLocalIpAddress();

  const localUrl = `http://localhost:${actualSignalingPort}`;
  const lanUrl = `http://${lanIp}:${actualSignalingPort}`;

  printAdBanner('P2P WebRTC');
  console.log(`  🎯 Target App:      ${pc.green(`http://${targetHost}:${targetPort}`)}`);
  console.log(`  💻 Local Viewer:   ${pc.underline(pc.cyan(localUrl))}`);
  console.log(`  📱 Network / Phone: ${pc.underline(pc.bold(pc.yellow(lanUrl)))}`);
  console.log(`  🔒 Security:        Direct End-to-End P2P WebRTC DataChannel\n`);

  if (!options.noQr) {
    console.log(pc.dim('  Scan QR with your phone to open instantly:'));
    printQrCode(lanUrl);
    console.log('');
  }

  return {
    targetPort,
    signalingPort: actualSignalingPort,
    localUrl,
    lanUrl,
    close: () => {
      bridge.close();
      signaling.close();
    },
  };
}

