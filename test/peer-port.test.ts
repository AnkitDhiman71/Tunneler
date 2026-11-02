import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { getLocalIpAddress } from '../src/network.js';
import { LocalHttpProxy } from '../src/proxy.js';
import { WebRtcBridge } from '../src/webrtc.js';
import { SignalingServer } from '../src/signaling.js';
import { PinGuardProxy } from '../src/guard.js';
import { CHUNK_SIZE } from '../src/protocol.js';

describe('peer-port core modules', () => {
  it('detects a valid local IP address', () => {
    const ip = getLocalIpAddress();
    expect(ip).toBeDefined();
    expect(typeof ip).toBe('string');
    expect(ip.length).toBeGreaterThan(0);
  });

  it('verifies protocol chunk size is 32KB safe limit', () => {
    expect(CHUNK_SIZE).toBe(32 * 1024);
  });

  it('creates WebRtcBridge and generates SDP offer with DataChannel', async () => {
    const proxy = new LocalHttpProxy({ targetPort: 3000 });
    const bridge = new WebRtcBridge({ proxy });

    expect(bridge.pc).toBeDefined();
    expect(bridge.pc.connectionState).toBe('new');

    const offerStr = await bridge.createCompleteOffer();
    expect(offerStr).toBeDefined();

    const offerObj = JSON.parse(offerStr);
    expect(offerObj.type).toBe('offer');
    expect(offerObj.sdp).toContain('m=application');

    bridge.close();
  });

  it('runs LocalHttpProxy against a dummy HTTP server', async () => {
    const dummyServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', message: 'Hello from test server' }));
    });

    await new Promise<void>((resolve) => dummyServer.listen(0, resolve));
    const port = (dummyServer.address() as any).port;

    let receivedTraffic = false;
    const proxy = new LocalHttpProxy({
      targetPort: port,
      onTraffic: ({ status, url }) => {
        if (status === 200 && url === '/api/test') {
          receivedTraffic = true;
        }
      },
    });

    let sentMessage: string | null = null;
    const mockChannel: any = {
      readyState: 'open',
      send: (data: string) => {
        sentMessage = data;
      },
    };

    proxy.handleIncomingRequest(mockChannel, {
      type: 'request',
      id: 'test_1',
      method: 'GET',
      url: '/api/test',
      headers: {},
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(sentMessage).not.toBeNull();
    const parsed = JSON.parse(sentMessage!);
    expect(parsed.statusCode).toBe(200);
    expect(parsed.id).toBe('test_1');
    expect(receivedTraffic).toBe(true);

    dummyServer.close();
  });

  it('starts SignalingServer and serves viewer files', async () => {
    const proxy = new LocalHttpProxy({ targetPort: 3000 });
    const bridge = new WebRtcBridge({ proxy });
    const signaling = new SignalingServer({ bridge, port: 0 });

    const port = await signaling.start();
    expect(port).toBeGreaterThan(0);

    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('peer-port');

    const swRes = await fetch(`http://localhost:${port}/sw.js`);
    expect(swRes.status).toBe(200);
    const swJs = await swRes.text();
    expect(swJs).toContain('Service Worker for peer-port');

    signaling.close();
    bridge.close();
  });

  it('enforces PIN protection and unlocks session', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Secret App Content on ${req.url}`);
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
      pin: '1324',
    });
    const guardPort = await guard.start();

    // Test unauthenticated
    const unauthRes = await fetch(`http://localhost:${guardPort}/home`);
    expect(unauthRes.status).toBe(200);
    const lockHtml = await unauthRes.text();
    expect(lockHtml).toContain('Access Protected');

    // Test correct PIN
    const correctPinRes = await fetch(`http://localhost:${guardPort}/__peer_auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'pin=1324&returnUrl=/home',
      redirect: 'manual',
    });
    expect(correctPinRes.status).toBe(302);
    const setCookie = correctPinRes.headers.get('set-cookie');
    expect(setCookie).toContain('peer_port_auth=');

    const cookieHeader = setCookie!.split(';')[0];
    const authRes = await fetch(`http://localhost:${guardPort}/home`, {
      headers: { Cookie: cookieHeader },
    });
    expect(authRes.status).toBe(200);
    const content = await authRes.text();
    expect(content).toBe('Secret App Content on /home');

    guard.close();
    appServer.close();
  });

  it('handles Admin Dashboard telemetry and Visual Feedback sticky notes', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><body><h1>My Web App</h1><button id="cta">Click Me</button></body></html>`);
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const proxy = new PinGuardProxy({
      targetPort: appPort,
      enableFeedback: true,
    });
    const proxyPort = await proxy.start();

    // 1. Verify HTML response has injected feedback widget
    const htmlRes = await fetch(`http://localhost:${proxyPort}/`);
    expect(htmlRes.status).toBe(200);
    const bodyHtml = await htmlRes.text();
    expect(bodyHtml).toContain('__peer_port_feedback_widget__');

    // 2. Submit Visual Feedback
    const fbRes = await fetch(`http://localhost:${proxyPort}/__peer_feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: 'Change this button to dark blue',
        selector: '#cta',
        elementText: 'Click Me',
        url: '/',
        screenSize: '390x844',
      }),
    });
    expect(fbRes.status).toBe(200);
    const fbJson = await fbRes.json();
    expect(fbJson.success).toBe(true);

    // 3. Verify Admin Dashboard contains feedback
    const adminRes = await fetch(`http://localhost:${proxyPort}/__peer_admin`);
    expect(adminRes.status).toBe(200);
    const adminHtml = await adminRes.text();
    expect(adminHtml).toContain('Executive Admin Center');
    expect(adminHtml).toContain('Change this button to dark blue');

    proxy.close();
    appServer.close();
  });

  it('executes Admin Superpowers: Kill Switch & IP Banning', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`App content: ${req.url}`);
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
    });
    const guardPort = await guard.start();

    // 1. Test Kill Switch: Activate Pause
    const pauseRes = await fetch(`http://localhost:${guardPort}/__peer_admin_action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_pause' }),
    });
    expect(pauseRes.status).toBe(200);
    const pauseData = await pauseRes.json();
    expect(pauseData.stats.isPaused).toBe(true);

    // Now regular visitor requests must receive 503 Paused screen
    const blockedRes = await fetch(`http://localhost:${guardPort}/home`);
    expect(blockedRes.status).toBe(503);
    const blockedHtml = await blockedRes.text();
    expect(blockedHtml).toContain('Tunnel Temporarily Paused');

    // 2. Test Kill Switch: Resume Public Access
    const resumeRes = await fetch(`http://localhost:${guardPort}/__peer_admin_action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_pause' }),
    });
    const resumeData = await resumeRes.json();
    expect(resumeData.stats.isPaused).toBe(false);

    const normalRes = await fetch(`http://localhost:${guardPort}/home`);
    expect(normalRes.status).toBe(200);

    // 3. Test IP Ban superpower
    const banRes = await fetch(`http://localhost:${guardPort}/__peer_admin_action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ban_ip', ip: '203.0.113.195' }),
    });
    expect(banRes.status).toBe(200);

    const bannedReq = await fetch(`http://localhost:${guardPort}/home`, {
      headers: { 'x-forwarded-for': '203.0.113.195' },
    });
    expect(bannedReq.status).toBe(403);
    const bannedHtml = await bannedReq.text();
    expect(bannedHtml).toContain('Your IP address has been blocked');

    guard.close();
    appServer.close();
  });
});
