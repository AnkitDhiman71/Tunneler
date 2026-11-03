import { RTCDataChannel, RTCPeerConnection } from 'werift';

interface GlobalTunnelOptions {
    targetPort: number;
    targetHost?: string;
    pin?: string;
    adminPassword?: string;
    enableFeedback?: boolean;
    noQr?: boolean;
}
interface GlobalTunnelInstance {
    targetPort: number;
    publicUrl: string;
    lanUrl: string;
    adminUrl: string;
    adminPassword: string;
    pin?: string;
    close: () => Promise<void>;
}
declare function startGlobalTunnel(options: GlobalTunnelOptions): Promise<GlobalTunnelInstance>;

interface TunnelOptions {
    targetPort: number;
    targetHost?: string;
    signalingPort?: number;
    noQr?: boolean;
}
interface TunnelInstance {
    targetPort: number;
    signalingPort: number;
    localUrl: string;
    lanUrl: string;
    close: () => void;
}
declare function startPeerTunnel(options: TunnelOptions): Promise<TunnelInstance>;

interface PeerHttpRequest {
    type: 'request';
    id: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    isBase64?: boolean;
}
interface PeerHttpResponseHeader {
    type: 'response-header';
    id: string;
    statusCode: number;
    statusMessage?: string;
    headers: Record<string, string>;
}
interface PeerHttpChunk {
    type: 'chunk';
    id: string;
    chunkIndex: number;
    totalChunks: number;
    data: string;
    isLast: boolean;
}
interface PeerHttpSimpleResponse {
    type: 'response';
    id: string;
    statusCode: number;
    statusMessage?: string;
    headers: Record<string, string>;
    body?: string;
    isBase64?: boolean;
}
type PeerMessage = PeerHttpRequest | PeerHttpResponseHeader | PeerHttpChunk | PeerHttpSimpleResponse | {
    type: 'ping';
    timestamp: number;
} | {
    type: 'pong';
    timestamp: number;
};
declare const CHUNK_SIZE: number;

interface ProxyOptions {
    targetPort: number;
    targetHost?: string;
    onTraffic?: (req: {
        method: string;
        url: string;
        status: number;
        duration: number;
    }) => void;
}
declare class LocalHttpProxy {
    private targetPort;
    private targetHost;
    private onTraffic?;
    constructor(options: ProxyOptions);
    /**
     * Forwards a request received over WebRTC DataChannel to the local server
     * and sends the response back over the channel.
     */
    handleIncomingRequest(channel: RTCDataChannel, req: PeerHttpRequest): void;
    private sendResponseOverChannel;
    private logTraffic;
}

interface WebRtcBridgeOptions {
    proxy: LocalHttpProxy;
    onConnected?: () => void;
    onDisconnected?: () => void;
}
declare class WebRtcBridge {
    pc: RTCPeerConnection;
    dataChannel: RTCDataChannel | null;
    private proxy;
    private onConnected?;
    private onDisconnected?;
    constructor(options: WebRtcBridgeOptions);
    private setupPeerEvents;
    createLocalDataChannel(name?: string): RTCDataChannel;
    private attachDataChannel;
    /**
     * Creates an SDP Offer and sets it as the local description.
     * Resolves after all ICE candidates have been gathered into the SDP.
     */
    createCompleteOffer(): Promise<string>;
    /**
     * Sets the remote description with the answer from the browser viewer.
     */
    handleAnswer(answerSdpJson: string): Promise<void>;
    close(): void;
}

interface SignalingServerOptions {
    port?: number;
    bridge: WebRtcBridge;
    viewerDir?: string;
}
declare class SignalingServer {
    private server;
    private wss;
    private bridge;
    private viewerDir;
    port: number;
    constructor(options: SignalingServerOptions);
    private handleHttpRequest;
    private setupWebSocket;
    start(): Promise<number>;
    close(): void;
}

declare const startTunnel: typeof startGlobalTunnel;

export { CHUNK_SIZE, type GlobalTunnelInstance, type GlobalTunnelOptions, LocalHttpProxy, type PeerHttpChunk, type PeerHttpRequest, type PeerHttpResponseHeader, type PeerHttpSimpleResponse, type PeerMessage, SignalingServer, type TunnelInstance, type TunnelOptions, WebRtcBridge, startGlobalTunnel, startPeerTunnel, startTunnel };
