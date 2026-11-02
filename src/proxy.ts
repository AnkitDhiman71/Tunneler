import http from 'node:http';
import https from 'node:https';
import { Buffer } from 'node:buffer';
import type { RTCDataChannel } from 'werift';
import type {
  PeerHttpRequest,
  PeerHttpSimpleResponse,
  PeerHttpChunk,
  PeerHttpResponseHeader,
} from './protocol.js';
import { CHUNK_SIZE } from './protocol.js';
import pc from 'picocolors';

export interface ProxyOptions {
  targetPort: number;
  targetHost?: string;
  onTraffic?: (req: { method: string; url: string; status: number; duration: number }) => void;
}

export class LocalHttpProxy {
  private targetPort: number;
  private targetHost: string;
  private onTraffic?: ProxyOptions['onTraffic'];

  constructor(options: ProxyOptions) {
    this.targetPort = options.targetPort;
    this.targetHost = options.targetHost || 'localhost';
    this.onTraffic = options.onTraffic;
  }

  /**
   * Forwards a request received over WebRTC DataChannel to the local server
   * and sends the response back over the channel.
   */
  public handleIncomingRequest(channel: RTCDataChannel, req: PeerHttpRequest): void {
    const startTime = Date.now();
    const url = req.url.startsWith('/') ? req.url : `/${req.url}`;

    // Clean headers - remove host and connection headers so the local server responds naturally
    const headers: Record<string, string> = { ...req.headers };
    headers['host'] = `${this.targetHost}:${this.targetPort}`;
    delete headers['connection'];
    delete headers['keep-alive'];

    const requestOptions: http.RequestOptions = {
      hostname: this.targetHost,
      port: this.targetPort,
      path: url,
      method: req.method,
      headers: headers,
      timeout: 30000,
    };

    const localReq = http.request(requestOptions, (localRes) => {
      const statusCode = localRes.statusCode || 200;
      const statusMessage = localRes.statusMessage || 'OK';

      // Normalize headers
      const resHeaders: Record<string, string> = {};
      for (const [key, val] of Object.entries(localRes.headers)) {
        if (val !== undefined) {
          resHeaders[key] = Array.isArray(val) ? val.join(', ') : String(val);
        }
      }

      const chunks: Buffer[] = [];
      localRes.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      localRes.on('end', () => {
        const fullBody = Buffer.concat(chunks);
        const duration = Date.now() - startTime;

        this.logTraffic(req.method, url, statusCode, duration);

        if (this.onTraffic) {
          this.onTraffic({ method: req.method, url, status: statusCode, duration });
        }

        // Send response back over WebRTC DataChannel
        this.sendResponseOverChannel(channel, req.id, statusCode, statusMessage, resHeaders, fullBody);
      });
    });

    localReq.on('error', (err) => {
      const duration = Date.now() - startTime;
      console.error(pc.red(`❌ [Proxy Error] ${req.method} ${url}: ${err.message}`));

      const errorBody = Buffer.from(
        `<h1>502 Bad Gateway - peer-port</h1><p>Cannot connect to localhost:${this.targetPort}: ${err.message}</p>`
      );

      this.sendResponseOverChannel(
        channel,
        req.id,
        502,
        'Bad Gateway',
        { 'content-type': 'text/html; charset=utf-8' },
        errorBody
      );
    });

    // Write request body if present
    if (req.body) {
      if (req.isBase64) {
        localReq.write(Buffer.from(req.body, 'base64'));
      } else {
        localReq.write(req.body);
      }
    }

    localReq.end();
  }

  private sendResponseOverChannel(
    channel: RTCDataChannel,
    id: string,
    statusCode: number,
    statusMessage: string,
    headers: Record<string, string>,
    body: Buffer
  ): void {
    if (channel.readyState !== 'open') {
      return;
    }

    // If small enough, send as single message
    if (body.length <= CHUNK_SIZE) {
      const response: PeerHttpSimpleResponse = {
        type: 'response',
        id,
        statusCode,
        statusMessage,
        headers,
        body: body.toString('base64'),
        isBase64: true,
      };
      channel.send(JSON.stringify(response));
      return;
    }

    // For larger responses (images, videos, large HTML/JS bundles), chunk it!
    const totalChunks = Math.ceil(body.length / CHUNK_SIZE);

    // 1. Send header first
    const headerMsg: PeerHttpResponseHeader = {
      type: 'response-header',
      id,
      statusCode,
      statusMessage,
      headers,
    };
    channel.send(JSON.stringify(headerMsg));

    // 2. Stream chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, body.length);
      const slice = body.subarray(start, end);

      const chunkMsg: PeerHttpChunk = {
        type: 'chunk',
        id,
        chunkIndex: i,
        totalChunks,
        data: slice.toString('base64'),
        isLast: i === totalChunks - 1,
      };

      channel.send(JSON.stringify(chunkMsg));
    }
  }

  private logTraffic(method: string, url: string, status: number, duration: number): void {
    let statusColored = pc.green(String(status));
    if (status >= 400 && status < 500) statusColored = pc.yellow(String(status));
    if (status >= 500) statusColored = pc.red(String(status));

    const methodColored = pc.cyan(method.padEnd(6));
    const durationColored = pc.dim(`${duration}ms`);

    console.log(`  ${pc.magenta('⇄')} ${methodColored} ${pc.white(url)} → ${statusColored} ${durationColored}`);
  }
}

