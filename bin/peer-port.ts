#!/usr/bin/env node

import process from 'node:process';
import { Command } from 'commander';
import { startGlobalTunnel } from '../src/tunnel.js';
import { startPeerTunnel } from '../src/p2p.js';
import pc from 'picocolors';

const program = new Command();

program
  .name('peer-port')
  .description('Instant Global Public Tunneling CLI - share localhost with automatic routing, optional PIN protection, and visual sticky-notes')
  .version('1.0.5')
  .argument('[port]', 'Local port to expose (e.g. 3000, 5000)')
  .option('-p, --port <number>', 'Local target port')
  .option('-h, --host <host>', 'Local target host', 'localhost')
  .option('--admin-pass <password>', 'Custom password to access the /__peer_admin dashboard')
  .option('--pin <password>', 'Optional password/PIN required for visitors to view your website')
  .option('--no-feedback', 'Disable the floating visual sticky-note feedback widget')
  .option('--p2p', 'Use direct WebRTC DataChannel P2P mode')
  .option('--no-qr', 'Disable terminal QR code rendering')
  .action(async (portArg, options) => {
    const rawPort = portArg || options.port || '3000';
    const port = parseInt(rawPort, 10);

    if (isNaN(port) || port <= 0 || port > 65535) {
      console.error(pc.red(`❌ Invalid port number: ${portArg}`));
      process.exit(1);
    }

    try {
      if (options.p2p) {
        const tunnel = await startPeerTunnel({
          targetPort: port,
          targetHost: options.host,
          noQr: !options.qr,
        });

        const cleanup = () => {
          console.log('\n' + pc.yellow('👋 Closing peer-port tunnel...'));
          tunnel.close();
          process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      } else {
        const tunnel = await startGlobalTunnel({
          targetPort: port,
          targetHost: options.host,
          adminPassword: options.adminPass,
          pin: options.pin ? String(options.pin) : undefined,
          enableFeedback: options.feedback,
          noQr: !options.qr,
        });

        const cleanup = async () => {
          console.log('\n' + pc.yellow('👋 Closing peer-port tunnel...'));
          await tunnel.close();
          process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      }
    } catch (err: any) {
      console.error(pc.red(`\n❌ Failed to start tunnel: ${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
