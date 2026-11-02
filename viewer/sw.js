// Service Worker for peer-port
// Intercepts network fetch requests and routes them through the WebRTC DataChannel

const pendingRequests = new Map();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.type === 'peer-response' && pendingRequests.has(data.id)) {
    const resolver = pendingRequests.get(data.id);
    pendingRequests.delete(data.id);
    resolver(data);
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept viewer assets, websocket, or service worker itself
  if (
    url.pathname === '/sw.js' ||
    url.pathname === '/ws' ||
    url.pathname.startsWith('/__peer_viewer') ||
    url.pathname === '/' && url.searchParams.has('viewer')
  ) {
    return;
  }

  // Only intercept requests destined for the proxied app
  event.respondWith(handleProxyFetch(event.request));
});

async function handleProxyFetch(request) {
  const id = 'req_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  // Extract headers
  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    headers[key] = value;
  }

  // Extract body if POST/PUT/PATCH
  let body = undefined;
  let isBase64 = false;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const arrayBuf = await request.arrayBuffer();
    if (arrayBuf.byteLength > 0) {
      body = arrayBufferToBase64(arrayBuf);
      isBase64 = true;
    }
  }

  const payload = {
    type: 'request',
    id,
    method: request.method,
    url: path,
    headers,
    body,
    isBase64,
  };

  // Find active client window to route through WebRTC
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (clients.length === 0) {
    return new Response('No active peer-port viewer window found.', { status: 503 });
  }

  const client = clients[0];

  return new Promise((resolve) => {
    pendingRequests.set(id, (resData) => {
      let responseBody = null;
      if (resData.body) {
        if (resData.isBase64) {
          responseBody = base64ToArrayBuffer(resData.body);
        } else {
          responseBody = resData.body;
        }
      }

      const resHeaders = new Headers(resData.headers || {});
      const response = new Response(responseBody, {
        status: resData.statusCode || 200,
        statusMessage: resData.statusMessage || 'OK',
        headers: resHeaders,
      });

      resolve(response);
    });

    // Send request to client window to forward over WebRTC DataChannel
    client.postMessage({ type: 'send-peer-request', payload });

    // 25 second timeout safeguard
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        resolve(new Response('peer-port gateway timeout: request took too long', { status: 504 }));
      }
    }, 25000);
  });
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

