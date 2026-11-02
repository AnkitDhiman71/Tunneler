export interface PeerHttpRequest {
  type: 'request';
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  isBase64?: boolean;
}

export interface PeerHttpResponseHeader {
  type: 'response-header';
  id: string;
  statusCode: number;
  statusMessage?: string;
  headers: Record<string, string>;
}

export interface PeerHttpChunk {
  type: 'chunk';
  id: string;
  chunkIndex: number;
  totalChunks: number;
  data: string; // base64 encoded
  isLast: boolean;
}

export interface PeerHttpSimpleResponse {
  type: 'response';
  id: string;
  statusCode: number;
  statusMessage?: string;
  headers: Record<string, string>;
  body?: string;
  isBase64?: boolean;
}

export type PeerMessage =
  | PeerHttpRequest
  | PeerHttpResponseHeader
  | PeerHttpChunk
  | PeerHttpSimpleResponse
  | { type: 'ping'; timestamp: number }
  | { type: 'pong'; timestamp: number };

export const CHUNK_SIZE = 32 * 1024; // 32KB safe chunk size for WebRTC DataChannel

