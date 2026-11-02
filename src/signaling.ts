import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import type { WebRtcBridge } from './webrtc.js';
import pc from 'picocolors';

export interface SignalingServerOptions {
  port?: number;
  bridge: WebRtcBridge;
  viewerDir?: string;
}

export class SignalingServer {
  private server: http.Server;
  private wss: WebSocketServer;
  private bridge: WebRtcBridge;
  private viewerDir: string;
  public port: number;

  constructor(options: SignalingServerOptions) {
    this.bridge = options.bridge;
    this.port = options.port || 4040;

    // Resolve viewer directory
    if (options.viewerDir) {
      this.viewerDir = options.viewerDir;
    } else {
      const candidates = [
        path.join(process.cwd(), 'viewer'),
        path.join(process.cwd(), '..', 'viewer'),
        path.resolve('viewer'),
      ];
      this.viewerDir = candidates.find((p) => fs.existsSync(p)) || path.join(process.cwd(), 'viewer');
    }

    this.server = http.createServer((req, res) => this.handleHttpRequest(req, res));
    this.wss = new WebSocketServer({ server: this.server, path: '/ws' });

    this.setupWebSocket();
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/';

    // Service Worker file
    if (url === '/sw.js') {
      const swPath = path.join(this.viewerDir, 'sw.js');
      if (fs.existsSync(swPath)) {
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Service-Worker-Allowed': '/',
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(swPath).pipe(res);
        return;
      }
    }

    // Default to index.html (SPA viewer)
    const indexPath = path.join(this.viewerDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Viewer files not found.');
  }

  private setupWebSocket(): void {
    this.wss.on('connection', async (ws: WebSocket) => {
      console.log(pc.cyan('  🔌 Browser viewer connected for WebRTC handshake...'));

      try {
        // 1. Generate SDP offer from our werift WebRtcBridge
        const offerSdp = await this.bridge.createCompleteOffer();

        // 2. Send SDP offer to the browser
        ws.send(JSON.stringify({ type: 'offer', sdp: offerSdp }));

        // 3. Listen for SDP answer from browser
        ws.on('message', async (raw: string | Buffer) => {
          try {
            const data = JSON.parse(raw.toString());
            if (data.type === 'answer') {
              console.log(pc.cyan('  📥 Received WebRTC SDP Answer from browser viewer!'));
              await this.bridge.handleAnswer(data.sdp);
              ws.send(JSON.stringify({ type: 'handshake-success' }));
            }
          } catch (err: any) {
            console.error(pc.red(`  ❌ Failed handling signaling message: ${err.message}`));
          }
        });
      } catch (err: any) {
        console.error(pc.red(`  ❌ Failed during signaling handshake: ${err.message}`));
      }
    });
  }

  public async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const tryListen = (attemptPort: number) => {
        this.server.once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
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

  public close(): void {
    this.wss.close();
    this.server.close();
  }
}
