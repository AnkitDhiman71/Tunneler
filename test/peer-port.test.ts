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

  it('enforces Admin Password protection on the Admin Center', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('App content');
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
      adminPassword: 'supersecretpass',
    });
    const guardPort = await guard.start();

    // 1. Visiting /__peer_admin unauthenticated should show Admin Login screen
    const unauthRes = await fetch(`http://localhost:${guardPort}/__peer_admin`);
    expect(unauthRes.status).toBe(200);
    const loginHtml = await unauthRes.text();
    expect(loginHtml).toContain('Admin Authentication');
    expect(loginHtml).toContain('name="password"');

    // 2. Submitting wrong admin password
    const wrongPassRes = await fetch(`http://localhost:${guardPort}/__peer_admin_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=wrongpass',
    });
    const wrongHtml = await wrongPassRes.text();
    expect(wrongHtml).toContain('Incorrect Admin Password');

    // 3. Submitting correct admin password gives admin session cookie
    const correctRes = await fetch(`http://localhost:${guardPort}/__peer_admin_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=supersecretpass',
      redirect: 'manual',
    });
    expect(correctRes.status).toBe(302);
    const adminCookie = correctRes.headers.get('set-cookie');
    expect(adminCookie).toContain('peer_admin_auth=');

    // 4. Authenticated admin request opens the real Dashboard
    const cookieHeader = adminCookie!.split(';')[0];
    const dashRes = await fetch(`http://localhost:${guardPort}/__peer_admin`, {
      headers: { Cookie: cookieHeader },
    });
    expect(dashRes.status).toBe(200);
    const dashHtml = await dashRes.text();
    expect(dashHtml).toContain('Executive Admin Center');
    expect(dashHtml).toContain('Grouped Page Requests');

    guard.close();
    appServer.close();
  });

  it('allows Admin to ban specific pages only while other pages remain active', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`App content for ${req.url}`);
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
      adminPassword: 'admin',
    });
    const guardPort = await guard.start();

    // Authenticate as Admin
    const loginRes = await fetch(`http://localhost:${guardPort}/__peer_admin_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=admin',
      redirect: 'manual',
    });
    const cookieHeader = loginRes.headers.get('set-cookie')!.split(';')[0];

    // Ban page '/checkout' only
    const banRes = await fetch(`http://localhost:${guardPort}/__peer_admin_action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({ action: 'toggle_disable_page', route: '/checkout' }),
    });
    expect(banRes.status).toBe(200);
    const banData = await banRes.json();
    expect(banData.stats.disabledPages).toContain('/checkout');

    // Test visitor to banned page '/checkout' -> returns 403 Page Disabled
    const checkoutRes = await fetch(`http://localhost:${guardPort}/checkout`);
    expect(checkoutRes.status).toBe(403);
    const checkoutHtml = await checkoutRes.text();
    expect(checkoutHtml).toContain('403 Page Disabled');

    // Test visitor to normal page '/home' -> works normally (200 OK)!
    const homeRes = await fetch(`http://localhost:${guardPort}/home`);
    expect(homeRes.status).toBe(200);
    const homeText = await homeRes.text();
    expect(homeText).toBe('App content for /home');

    guard.close();
    appServer.close();
  });

  it('groups child asset requests under parent page visit', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body>Page content</body></html>`);
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
      adminPassword: 'admin',
    });
    const guardPort = await guard.start();

    // Visit parent page /dashboard
    await fetch(`http://localhost:${guardPort}/dashboard`);
    // Sub-requests triggered by that page:
    await fetch(`http://localhost:${guardPort}/styles.css`);
    await fetch(`http://localhost:${guardPort}/bundle.js`);
    await fetch(`http://localhost:${guardPort}/logo.png`);

    const stats = guard.telemetry.getStats();
    expect(stats.requestGroups.length).toBeGreaterThanOrEqual(1);

    const parent = stats.requestGroups[0];
    expect(parent.url).toBe('/dashboard');
    // All 4 requests grouped under this parent page
    expect(parent.subRequests.length).toBe(4);

    guard.close();
    appServer.close();
  });

  it('tracks visitor intelligence, parses device type and location', () => {
    const guard = new PinGuardProxy({
      targetPort: 3000,
    });

    guard.telemetry.recordRequestEnd(
      'GET',
      '/products',
      200,
      25,
      '203.0.113.195',
      {
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'cf-ipcountry': 'IN',
      }
    );

    const stats = guard.telemetry.getStats();
    expect(stats.visitors.length).toBe(1);
    const vis = stats.visitors[0];
    expect(vis.ip).toBe('203.0.113.195');
    expect(vis.countryCode).toBe('IN');
    expect(vis.countryName).toBe('India');
    expect(vis.deviceType).toBe('Mobile');
    expect(vis.os).toBe('iOS');
    expect(vis.browser).toContain('Safari');
    expect(vis.visitedRoutes).toContain('/products');
  });

  it('enforces IP firewall ban on blocked IP addresses', async () => {
    const appServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Welcome, visitor!');
    });
    await new Promise<void>((resolve) => appServer.listen(0, resolve));
    const appPort = (appServer.address() as any).port;

    const guard = new PinGuardProxy({
      targetPort: appPort,
    });
    const guardPort = await guard.start();

    // Normal access works
    const res1 = await fetch(`http://localhost:${guardPort}/`);
    expect(res1.status).toBe(200);

    // Block localhost IP
    guard.telemetry.toggleBlockVisitorIp('127.0.0.1');
    guard.telemetry.toggleBlockVisitorIp('::1');

    // Blocked access returns 403 Forbidden
    const res2 = await fetch(`http://localhost:${guardPort}/`);
    expect(res2.status).toBe(403);
    const text2 = await res2.text();
    expect(text2).toContain('403 Access Denied');

    guard.close();
    appServer.close();
  });
});
