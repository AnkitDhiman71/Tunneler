import { RTCPeerConnection, type RTCDataChannel } from 'werift';
import type { PeerHttpRequest, PeerMessage } from './protocol.js';
import type { LocalHttpProxy } from './proxy.js';
import pc from 'picocolors';

export interface WebRtcBridgeOptions {
  proxy: LocalHttpProxy;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class WebRtcBridge {
  public pc: RTCPeerConnection;
  public dataChannel: RTCDataChannel | null = null;
  private proxy: LocalHttpProxy;
  private onConnected?: () => void;
  private onDisconnected?: () => void;

  constructor(options: WebRtcBridgeOptions) {
    this.proxy = options.proxy;
    this.onConnected = options.onConnected;
    this.onDisconnected = options.onDisconnected;

    this.pc = new RTCPeerConnection();
    this.setupPeerEvents();
  }

  private setupPeerEvents(): void {
    this.pc.connectionStateChange.subscribe((state) => {
      if (state === 'connected') {
        console.log(pc.green('  ✔ WebRTC PeerConnection established! Direct P2P tunnel active.'));
        if (this.onConnected) this.onConnected();
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log(pc.yellow(`  ⚠ WebRTC PeerConnection state: ${state}`));
        if (this.onDisconnected) this.onDisconnected();
      }
    });

    // When the remote peer creates a data channel
    this.pc.onDataChannel.subscribe((dc) => {
      this.attachDataChannel(dc);
    });
  }

  public createLocalDataChannel(name = 'peer-port-channel'): RTCDataChannel {
    const dc = this.pc.createDataChannel(name, {
      ordered: true,
    });
    this.attachDataChannel(dc);
    return dc;
  }

  private attachDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;

    channel.stateChanged.subscribe((state) => {
      if (state === 'open') {
        console.log(pc.green('  ✔ WebRTC DataChannel open! Ready for HTTP traffic.'));
      } else if (state === 'closed') {
        console.log(pc.yellow('  ⚠ WebRTC DataChannel closed.'));
      }
    });

    channel.message.subscribe((data) => {
      try {
        const raw = typeof data === 'string' ? data : data.toString();
        const parsed: PeerMessage = JSON.parse(raw);

        if (parsed.type === 'request') {
          this.proxy.handleIncomingRequest(channel, parsed as PeerHttpRequest);
        } else if (parsed.type === 'ping') {
          channel.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (err: any) {
        console.error(pc.red(`  ❌ Failed to parse incoming WebRTC message: ${err.message}`));
      }
    });
  }

  /**
   * Creates an SDP Offer and sets it as the local description.
   * Resolves after all ICE candidates have been gathered into the SDP.
   */
  public async createCompleteOffer(): Promise<string> {
    this.createLocalDataChannel();
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Wait for ICE gathering to complete so the SDP contains candidates
    if (this.pc.iceGatheringState !== 'complete') {
      await new Promise<void>((resolve) => {
        const sub = this.pc.iceGatheringStateChange.subscribe((state) => {
          if (state === 'complete') {
            resolve();
          }
        });
        // Safety timeout of 2.5 seconds
        setTimeout(resolve, 2500);
      });
    }

    return JSON.stringify(this.pc.localDescription);
  }

  /**
   * Sets the remote description with the answer from the browser viewer.
   */
  public async handleAnswer(answerSdpJson: string): Promise<void> {
    const sdpObj = typeof answerSdpJson === 'string' ? JSON.parse(answerSdpJson) : answerSdpJson;
    await this.pc.setRemoteDescription(sdpObj);
  }

  public close(): void {
    try {
      if (this.dataChannel) {
        this.dataChannel.close();
      }
      this.pc.close();
    } catch {}
  }
}
