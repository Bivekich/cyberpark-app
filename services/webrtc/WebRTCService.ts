import EventEmitter from 'eventemitter3';

export interface WebRTCConfig {
  carId: string;
  signalServerUrl: string;
  iceServers: RTCIceServer[];
}

export interface CarStreamData {
  video: boolean;
  audio: boolean;
  telemetry: boolean;
}

export interface CarControlCommand {
  type: 'movement' | 'speed' | 'light' | 'horn';
  data: {
    x?: number; // -1 to 1
    y?: number; // -1 to 1
    speed?: number; // 0 to 100
    enabled?: boolean;
  };
  timestamp: number;
}

export interface CarTelemetryData {
  speed: number;
  batteryLevel: number;
  gpsLocation: { lat: number; lng: number };
  orientation: { x: number; y: number; z: number };
  temperature: number;
  timestamp: number;
}

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private webSocket: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: WebRTCConfig | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  // Initialize connection to car
  async connect(config: WebRTCConfig): Promise<void> {
    try {
      this.config = config;
      this.setConnectionState(ConnectionState.CONNECTING);
      
      await this.setupPeerConnection();
      await this.connectToSignalServer();
      
      this.emit('connecting', { carId: config.carId });
    } catch (error) {
      console.error('Failed to connect:', error);
      this.setConnectionState(ConnectionState.FAILED);
      this.emit('error', error);
      throw error;
    }
  }

  // Disconnect from car
  async disconnect(): Promise<void> {
    this.cleanup();
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.emit('disconnected');
  }

  // Send control command to car
  sendControlCommand(command: CarControlCommand): void {
    if (this.dataChannel?.readyState === 'open') {
      const message = JSON.stringify({
        type: 'control',
        payload: command,
      });
      this.dataChannel.send(message);
      this.emit('commandSent', command);
    } else {
      console.warn('Data channel not ready, command not sent:', command);
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Get remote video stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Enable/disable car lights
  toggleLights(enabled: boolean): void {
    this.sendControlCommand({
      type: 'light',
      data: { enabled },
      timestamp: Date.now(),
    });
  }

  // Sound car horn
  soundHorn(): void {
    this.sendControlCommand({
      type: 'horn',
      data: { enabled: true },
      timestamp: Date.now(),
    });
  }

  private async setupPeerConnection(): Promise<void> {
    const configuration: RTCConfiguration = {
      iceServers: this.config?.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.emit('remoteStreamReceived', this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.webSocket?.readyState === WebSocket.OPEN) {
        this.sendSignalMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('Peer connection state:', state);
      
      switch (state) {
        case 'connected':
          this.setConnectionState(ConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          break;
        case 'disconnected':
        case 'failed':
          this.setConnectionState(ConnectionState.FAILED);
          this.attemptReconnect();
          break;
      }
    };

    // Setup data channel for car control
    this.dataChannel = this.peerConnection.createDataChannel('carControl', {
      ordered: true,
    });

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.emit('dataChannelOpened');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleDataChannelMessage(message);
      } catch (error) {
        console.error('Failed to parse data channel message:', error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('error', error);
    };
  }

  private async connectToSignalServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('No configuration available'));
        return;
      }

      const wsUrl = `${this.config.signalServerUrl}/car/${this.config.carId}`;
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        console.log('Connected to signal server');
        resolve();
      };

      this.webSocket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          await this.handleSignalMessage(message);
        } catch (error) {
          console.error('Failed to handle signal message:', error);
        }
      };

      this.webSocket.onerror = (error) => {
        console.error('Signal server error:', error);
        reject(error);
      };

      this.webSocket.onclose = () => {
        console.log('Signal server connection closed');
        if (this.connectionState !== ConnectionState.DISCONNECTED) {
          this.attemptReconnect();
        }
      };
    });
  }

  private async handleSignalMessage(message: any): Promise<void> {
    if (!this.peerConnection) return;

    switch (message.type) {
      case 'offer':
        await this.peerConnection.setRemoteDescription(message.offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.sendSignalMessage({
          type: 'answer',
          answer: answer,
        });
        break;

      case 'ice-candidate':
        if (message.candidate) {
          await this.peerConnection.addIceCandidate(message.candidate);
        }
        break;

      case 'car-status':
        this.emit('carStatusUpdate', message.status);
        break;
    }
  }

  private handleDataChannelMessage(message: any): void {
    switch (message.type) {
      case 'telemetry':
        this.emit('telemetryUpdate', message.payload as CarTelemetryData);
        break;
      case 'status':
        this.emit('carStatusUpdate', message.payload);
        break;
      case 'error':
        this.emit('carError', message.payload);
        break;
    }
  }

  private sendSignalMessage(message: any): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.emit('connectionStateChanged', state);
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setConnectionState(ConnectionState.FAILED);
      this.emit('reconnectFailed');
      return;
    }

    this.setConnectionState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(async () => {
      try {
        if (this.config) {
          await this.connect(this.config);
        }
      } catch (error) {
        console.error('Reconnect attempt failed:', error);
        this.attemptReconnect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.dataChannel?.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now(),
        }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private setupEventHandlers(): void {
    // Setup any additional event handlers here
  }

  private cleanup(): void {
    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close WebSocket
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    // Clean up streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
export const webRTCService = new WebRTCService(); 