#!/usr/bin/env node
import {
  startGlobalTunnel,
  startPeerTunnel
} from "./chunk-5SHQM2HM.js";

// bin/peer-port.ts
import process from "process";
import { Command } from "commander";
import pc from "picocolors";
var program = new Command();
program.name("peer-port").description("Instant Global Public Tunneling CLI - share localhost with automatic routing, optional PIN protection, and visual sticky-notes").version("1.0.5").argument("[port]", "Local port to expose (e.g. 3000, 5000)").option("-p, --port <number>", "Local target port").option("-h, --host <host>", "Local target host", "localhost").option("--admin-pass <password>", "Custom password to access the /__peer_admin dashboard").option("--pin <password>", "Optional password/PIN required for visitors to view your website").option("--no-feedback", "Disable the floating visual sticky-note feedback widget").option("--p2p", "Use direct WebRTC DataChannel P2P mode").option("--no-qr", "Disable terminal QR code rendering").action(async (portArg, options) => {
  const rawPort = portArg || options.port || "3000";
  const port = parseInt(rawPort, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    console.error(pc.red(`\u274C Invalid port number: ${portArg}`));
    process.exit(1);
  }
  try {
    if (options.p2p) {
      const tunnel = await startPeerTunnel({
        targetPort: port,
        targetHost: options.host,
        noQr: !options.qr
      });
      const cleanup = () => {
        console.log("\n" + pc.yellow("\u{1F44B} Closing peer-port tunnel..."));
        tunnel.close();
        process.exit(0);
      };
      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
    } else {
      const tunnel = await startGlobalTunnel({
        targetPort: port,
        targetHost: options.host,
        adminPassword: options.adminPass,
        pin: options.pin ? String(options.pin) : void 0,
        enableFeedback: options.feedback,
        noQr: !options.qr
      });
      const cleanup = async () => {
        console.log("\n" + pc.yellow("\u{1F44B} Closing peer-port tunnel..."));
        await tunnel.close();
        process.exit(0);
      };
      process.on("SIGINT", cleanup);
      process.on("SIGTERM", cleanup);
    }
  } catch (err) {
    console.error(pc.red(`
\u274C Failed to start tunnel: ${err.message}`));
    process.exit(1);
  }
});
program.parse(process.argv);
//# sourceMappingURL=peer-port.js.map