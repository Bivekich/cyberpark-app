import EventEmitter from 'eventemitter3';
import { WebRTCConfig, CarControlCommand, CarTelemetryData, ConnectionState } from './WebRTCService';

export class MockWebRTCService extends EventEmitter {
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private config: WebRTCConfig | null = null;
  private mockStream: MediaStream | null = null;
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;
  private commandEffectTimeout: ReturnType<typeof setTimeout> | null = null;
  private mockTelemetryData: CarTelemetryData = {
    speed: 0,
    batteryLevel: 85,
    gpsLocation: { lat: 55.7558, lng: 37.6173 }, // Moscow coordinates
    orientation: { x: 0, y: 0, z: 0 },
    temperature: 22,
    timestamp: Date.now(),
  };

  constructor() {
    super();
  }

  async connect(config: WebRTCConfig): Promise<void> {
    try {
      this.config = config;
      this.setConnectionState(ConnectionState.CONNECTING);
      
      console.log('[MockWebRTC] Connecting to car simulator...', config.carId);
      
      // Simulate connection delay
      await this.delay(2000);
      
      this.setConnectionState(ConnectionState.CONNECTED);
      this.createMockStream();
      this.startTelemetrySimulation();
      
      console.log('[MockWebRTC] Connected successfully');
      this.emit('connecting', { carId: config.carId });
      
    } catch (error) {
      console.error('[MockWebRTC] Connection failed:', error);
      this.setConnectionState(ConnectionState.FAILED);
      this.emit('error', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('[MockWebRTC] Disconnecting...');
    this.cleanup();
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.emit('disconnected');
  }

  sendControlCommand(command: CarControlCommand): void {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      console.warn('[MockWebRTC] Not connected, command ignored:', command);
      return;
    }

    console.log('[MockWebRTC] Sending command:', command.type, command.data);
    
    // Note: In real implementation, commands would be sent to car
    // and telemetry would come back from car's systems
    
    this.emit('commandSent', command);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getRemoteStream(): MediaStream | null {
    return this.mockStream;
  }

  toggleLights(enabled: boolean): void {
    this.sendControlCommand({
      type: 'light',
      data: { enabled },
      timestamp: Date.now(),
    });
  }

  soundHorn(): void {
    this.sendControlCommand({
      type: 'horn',
      data: { enabled: true },
      timestamp: Date.now(),
    });
  }

  private createMockStream(): void {
    // For React Native, we'll simulate having a stream without actually creating one
    // In a real implementation, you'd use react-native-webrtc
    console.log('[MockWebRTC] Simulating video stream');
    
    // Create a fake MediaStream-like object
    this.mockStream = {
      getTracks: () => [],
      getVideoTracks: () => [{ kind: 'video', id: 'mock-video' }],
      getAudioTracks: () => [{ kind: 'audio', id: 'mock-audio' }],
      id: 'mock-stream'
    } as any;
    
    // Emit after a short delay to simulate stream setup
    setTimeout(() => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.emit('remoteStreamReceived', this.mockStream);
        console.log('[MockWebRTC] Mock video stream received');
      }
    }, 500);
  }

  private startTelemetrySimulation(): void {
    console.log('[MockWebRTC] Starting telemetry simulation');
    
    this.telemetryInterval = setInterval(() => {
      // Simulate realistic telemetry data coming from car's systems
      // In real implementation, this would come from WebRTC data channel
      
      this.mockTelemetryData.timestamp = Date.now();
      
      // Simulate car's onboard computer providing real telemetry
      // Battery level would come from car's BMS (Battery Management System)
      this.mockTelemetryData.batteryLevel = this.simulateCarBattery();
      
      // Speed would come from car's odometer/GPS
      this.mockTelemetryData.speed = this.simulateCarSpeed();
      
      // Temperature from car's thermal sensors
      this.mockTelemetryData.temperature = this.simulateCarTemperature();
      
      // GPS coordinates from car's GPS system
      this.mockTelemetryData.gpsLocation = this.simulateCarGPS();
      
      // Orientation from car's IMU (Inertial Measurement Unit)
      this.mockTelemetryData.orientation = this.simulateCarOrientation();
      
      this.emit('telemetryUpdate', { ...this.mockTelemetryData });
    }, 1000); // Update every second as real cars would
  }

  private simulateCarBattery(): number {
    // Simulate realistic battery behavior from car's BMS
    let battery = this.mockTelemetryData.batteryLevel;
    
    // Battery drain based on usage
    if (this.mockTelemetryData.speed > 0) {
      // Drain rate depends on speed (higher speed = more drain)
      const drainRate = 0.005 + (this.mockTelemetryData.speed * 0.0001);
      battery = Math.max(0, battery - drainRate);
    }
    
    // Simulate slight measurement variations (real sensors aren't perfect)
    battery += (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(100, Math.round(battery * 100) / 100));
  }

  private simulateCarSpeed(): number {
    // Speed data would come from car's odometer/wheel sensors
    let speed = this.mockTelemetryData.speed;
    
    // Gradual deceleration when no input (realistic physics)
    if (speed > 0) {
      speed = Math.max(0, speed * 0.95); // Natural deceleration
    }
    
    // Add slight sensor noise
    speed += (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.round(speed * 10) / 10);
  }

  private simulateCarTemperature(): number {
    // Temperature from car's thermal management system
    let temp = this.mockTelemetryData.temperature;
    
    // Temperature affected by motor usage
    if (this.mockTelemetryData.speed > 0) {
      temp += 0.01; // Motor heat
    } else {
      temp -= 0.005; // Cooling down
    }
    
    // Environmental factors
    temp += (Math.random() - 0.5) * 0.2;
    
    // Realistic temperature bounds for electric motors
    return Math.max(15, Math.min(35, Math.round(temp * 10) / 10));
  }

  private simulateCarGPS(): { lat: number; lng: number } {
    // GPS coordinates from car's navigation system
    const currentGPS = this.mockTelemetryData.gpsLocation;
    
    // Simulate slight GPS drift/movement
    const lat = currentGPS.lat + (Math.random() - 0.5) * 0.00001;
    const lng = currentGPS.lng + (Math.random() - 0.5) * 0.00001;
    
    return { lat, lng };
  }

  private simulateCarOrientation(): { x: number; y: number; z: number } {
    // Orientation from car's IMU sensors
    const current = this.mockTelemetryData.orientation;
    
    // Simulate slight sensor variations
    return {
      x: current.x + (Math.random() - 0.5) * 0.5,
      y: current.y + (Math.random() - 0.5) * 0.5,
      z: current.z + (Math.random() - 0.5) * 0.5
    };
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      console.log('[MockWebRTC] Connection state changed to', state);
      this.emit('connectionStateChanged', state);
    }
  }

  private cleanup(): void {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    
    if (this.commandEffectTimeout) {
      clearTimeout(this.commandEffectTimeout);
      this.commandEffectTimeout = null;
    }
    
    if (this.mockStream) {
      // Simulate stopping tracks
      this.mockStream = null;
    }
    
    this.removeAllListeners();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance for testing
export const mockWebRTCService = new MockWebRTCService(); 