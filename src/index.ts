import { startGlobalTunnel, type GlobalTunnelOptions, type GlobalTunnelInstance } from './tunnel.js';
import { startPeerTunnel, type TunnelOptions, type TunnelInstance } from './p2p.js';

export { startGlobalTunnel, type GlobalTunnelOptions, type GlobalTunnelInstance };
export { startPeerTunnel, type TunnelOptions, type TunnelInstance };

// Default export: startGlobalTunnel
export const startTunnel = startGlobalTunnel;

export { LocalHttpProxy } from './proxy.js';
export { WebRtcBridge } from './webrtc.js';
export { SignalingServer } from './signaling.js';
export * from './protocol.js';
