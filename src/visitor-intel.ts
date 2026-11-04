export interface VisitorProfile {
  id: string;
  ip: string;
  countryCode: string;
  countryName: string;
  flag: string;
  lat: number;
  lng: number;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot';
  os: string;
  browser: string;
  firstSeen: number;
  lastActive: number;
  requestCount: number;
  visitedRoutes: string[];
  isBlocked: boolean;
  avgLatency: number;
  totalDuration: number;
}

export interface GeoLocation {
  countryCode: string;
  countryName: string;
  flag: string;
  lat: number;
  lng: number;
}

const COUNTRY_REGISTRY: Record<string, GeoLocation> = {
  IN: { countryCode: 'IN', countryName: 'India', flag: '🇮🇳', lat: 20.59, lng: 78.96 },
  US: { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', lat: 37.09, lng: -95.71 },
  GB: { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', lat: 55.37, lng: -3.43 },
  CA: { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', lat: 56.13, lng: -106.34 },
  DE: { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', lat: 51.16, lng: 10.45 },
  FR: { countryCode: 'FR', countryName: 'France', flag: '🇫🇷', lat: 46.22, lng: 2.21 },
  AU: { countryCode: 'AU', countryName: 'Australia', flag: '🇦🇺', lat: -25.27, lng: 133.77 },
  JP: { countryCode: 'JP', countryName: 'Japan', flag: '🇯🇵', lat: 36.20, lng: 138.25 },
  SG: { countryCode: 'SG', countryName: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82 },
  AE: { countryCode: 'AE', countryName: 'UAE', flag: '🇦🇪', lat: 23.42, lng: 53.84 },
  BR: { countryCode: 'BR', countryName: 'Brazil', flag: '🇧🇷', lat: -14.23, lng: -51.92 },
  NL: { countryCode: 'NL', countryName: 'Netherlands', flag: '🇳🇱', lat: 52.13, lng: 5.29 },
  RU: { countryCode: 'RU', countryName: 'Russia', flag: '🇷🇺', lat: 61.52, lng: 105.31 },
  CN: { countryCode: 'CN', countryName: 'China', flag: '🇨🇳', lat: 35.86, lng: 104.19 },
  IT: { countryCode: 'IT', countryName: 'Italy', flag: '🇮🇹', lat: 41.87, lng: 12.56 },
  ES: { countryCode: 'ES', countryName: 'Spain', flag: '🇪🇸', lat: 40.46, lng: -3.75 },
  PK: { countryCode: 'PK', countryName: 'Pakistan', flag: '🇵🇰', lat: 30.37, lng: 69.34 },
  BD: { countryCode: 'BD', countryName: 'Bangladesh', flag: '🇧🇩', lat: 23.68, lng: 90.35 },
  ID: { countryCode: 'ID', countryName: 'Indonesia', flag: '🇮🇩', lat: -0.78, lng: 113.92 },
  ZA: { countryCode: 'ZA', countryName: 'South Africa', flag: '🇿🇦', lat: -30.55, lng: 22.93 },
  SE: { countryCode: 'SE', countryName: 'Sweden', flag: '🇸🇪', lat: 60.12, lng: 18.64 },
  CH: { countryCode: 'CH', countryName: 'Switzerland', flag: '🇨🇭', lat: 46.81, lng: 8.22 },
  KR: { countryCode: 'KR', countryName: 'South Korea', flag: '🇰🇷', lat: 35.90, lng: 127.76 },
  MY: { countryCode: 'MY', countryName: 'Malaysia', flag: '🇲🇾', lat: 4.21, lng: 101.97 },
};

export class VisitorIntelligence {
  private visitors = new Map<string, VisitorProfile>();
  private blockedIps = new Set<string>();

  public parseUserAgent(ua: string): { deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot'; os: string; browser: string } {
    if (!ua) {
      return { deviceType: 'Desktop', os: 'Unknown OS', browser: 'Browser' };
    }

    // Bot detection
    if (/bot|crawler|spider|curl|wget|postman|insomnia|headless/i.test(ua)) {
      return { deviceType: 'Bot', os: 'Automated Tool', browser: 'Bot / API Client' };
    }

    // Device Type
    let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' = 'Desktop';
    if (/iPad|Tablet|PlayBook/i.test(ua)) {
      deviceType = 'Tablet';
    } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = 'Mobile';
    }

    // Operating System
    let os = 'Unknown OS';
    if (/Windows NT 10/i.test(ua)) os = 'Windows 11 / 10';
    else if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    // Browser
    let browser = 'Browser';
    if (/Edg\/([\d]+)/i.test(ua)) browser = `Edge ${RegExp.$1}`;
    else if (/OPR\/([\d]+)/i.test(ua)) browser = `Opera ${RegExp.$1}`;
    else if (/Chrome\/([\d]+)/i.test(ua)) browser = `Chrome ${RegExp.$1}`;
    else if (/Firefox\/([\d]+)/i.test(ua)) browser = `Firefox ${RegExp.$1}`;
    else if (/Version\/([\d]+).*Safari/i.test(ua)) browser = `Safari ${RegExp.$1}`;

    return { deviceType, os, browser };
  }

  public resolveGeo(headers: Record<string, any>, ip: string): GeoLocation {
    const cfCountry = (headers['cf-ipcountry'] || headers['x-country-code'] || '').toUpperCase();
    if (cfCountry && COUNTRY_REGISTRY[cfCountry]) {
      return COUNTRY_REGISTRY[cfCountry];
    }

    // Check for local loopback
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { countryCode: 'LOCAL', countryName: 'Local Development Host', flag: '📍', lat: 20.59, lng: 78.96 };
    }

    if (cfCountry && cfCountry.length === 2) {
      return { countryCode: cfCountry, countryName: `Region (${cfCountry})`, flag: '🌐', lat: 20.0, lng: 0.0 };
    }

    return { countryCode: 'IN', countryName: 'India', flag: '🇮🇳', lat: 20.59, lng: 78.96 };
  }

  public recordHit(ip: string, url: string, headers: Record<string, any>, duration: number): VisitorProfile {
    const ua = headers['user-agent'] || '';
    const visitorKey = `${ip}_${ua.slice(0, 30)}`;

    let profile = this.visitors.get(visitorKey);
    const now = Date.now();

    if (!profile) {
      const geo = this.resolveGeo(headers, ip);
      const parsedUA = this.parseUserAgent(ua);

      profile = {
        id: 'vis_' + Math.random().toString(36).substring(2, 9),
        ip,
        countryCode: geo.countryCode,
        countryName: geo.countryName,
        flag: geo.flag,
        lat: geo.lat,
        lng: geo.lng,
        deviceType: parsedUA.deviceType,
        os: parsedUA.os,
        browser: parsedUA.browser,
        firstSeen: now,
        lastActive: now,
        requestCount: 1,
        visitedRoutes: [url.split('?')[0]],
        isBlocked: this.blockedIps.has(ip),
        avgLatency: duration,
        totalDuration: duration,
      };
      this.visitors.set(visitorKey, profile);
    } else {
      profile.lastActive = now;
      profile.requestCount++;
      profile.totalDuration += duration;
      profile.avgLatency = Math.round(profile.totalDuration / profile.requestCount);

      const cleanRoute = url.split('?')[0];
      if (!profile.visitedRoutes.includes(cleanRoute)) {
        profile.visitedRoutes.push(cleanRoute);
        if (profile.visitedRoutes.length > 20) profile.visitedRoutes.shift();
      }
      profile.isBlocked = this.blockedIps.has(ip);
    }

    return profile;
  }

  public toggleBlockIp(ip: string): boolean {
    if (this.blockedIps.has(ip)) {
      this.blockedIps.delete(ip);
      for (const v of this.visitors.values()) {
        if (v.ip === ip) v.isBlocked = false;
      }
      return false; // unblocked
    } else {
      this.blockedIps.add(ip);
      for (const v of this.visitors.values()) {
        if (v.ip === ip) v.isBlocked = true;
      }
      return true; // blocked
    }
  }

  public isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip);
  }

  public getVisitorsList(): VisitorProfile[] {
    return Array.from(this.visitors.values())
      .sort((a, b) => b.lastActive - a.lastActive)
      .slice(0, 100);
  }

  public getSummaryStats() {
    const visitors = this.getVisitorsList();
    const now = Date.now();
    const activeNow = visitors.filter((v) => now - v.lastActive < 120000).length;

    const countryCounts: Record<string, { count: number; name: string; flag: string; lat: number; lng: number }> = {};
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;

    for (const v of visitors) {
      if (!countryCounts[v.countryCode]) {
        countryCounts[v.countryCode] = { count: 0, name: v.countryName, flag: v.flag, lat: v.lat, lng: v.lng };
      }
      countryCounts[v.countryCode].count += v.requestCount;

      if (v.deviceType === 'Mobile') mobileCount++;
      else if (v.deviceType === 'Tablet') tabletCount++;
      else desktopCount++;
    }

    return {
      totalVisitors: visitors.length,
      activeNow,
      blockedCount: this.blockedIps.size,
      countries: Object.entries(countryCounts).map(([code, data]) => ({
        code,
        name: data.name,
        flag: data.flag,
        requests: data.count,
        lat: data.lat,
        lng: data.lng,
      })),
      devices: {
        desktop: desktopCount,
        mobile: mobileCount,
        tablet: tabletCount,
      },
    };
  }
}

