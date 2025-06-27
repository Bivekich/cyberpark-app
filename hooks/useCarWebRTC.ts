import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  webRTCService, 
  ConnectionState, 
  CarTelemetryData,
  CarControlCommand,
  WebRTCConfig 
} from '@/services/webrtc/WebRTCService';

interface CarWebRTCData {
  speed: number;
  batteryLevel: number;
  gpsLocation?: { lat: number; lng: number };
  temperature?: number;
}

interface UseCarWebRTCResult {
  // Connection state
  connectionState: ConnectionState;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  
  // Car data
  carData: CarWebRTCData;
  
  // Control methods
  connect: (config: WebRTCConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMovement: (x: number, y: number) => void;
  toggleLights: (enabled: boolean) => void;
  soundHorn: () => void;
  
  // Stream controls
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
}

export function useCarWebRTC(): UseCarWebRTCResult {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [carData, setCarData] = useState<CarWebRTCData>({
    speed: 0,
    batteryLevel: 0,
  });

  const isConnecting = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING;
  const isConnected = connectionState === ConnectionState.CONNECTED;

  useEffect(() => {
    setupWebRTCListeners();
    
    return () => {
      webRTCService.removeAllListeners();
    };
  }, []);

  const setupWebRTCListeners = useCallback(() => {
    webRTCService.on('connectionStateChanged', (state: ConnectionState) => {
      setConnectionState(state);
      
      if (state === ConnectionState.FAILED) {
        Alert.alert(
          'Ошибка подключения',
          'Не удалось подключиться к машине. Проверьте интернет-соединение.'
        );
      } else if (state === ConnectionState.CONNECTED) {
        console.log('Successfully connected to car stream');
      }
    });

    webRTCService.on('remoteStreamReceived', (stream: MediaStream) => {
      console.log('Remote stream received, tracks:', stream.getTracks().length);
      setRemoteStream(stream);
    });

    webRTCService.on('telemetryUpdate', (data: CarTelemetryData) => {
      setCarData({
        speed: data.speed,
        batteryLevel: data.batteryLevel,
        gpsLocation: data.gpsLocation,
        temperature: data.temperature,
      });
    });

    webRTCService.on('error', (error: any) => {
      console.error('WebRTC error:', error);
      Alert.alert(
        'Ошибка видеосвязи',
        'Проблема с передачей видео. Попробуйте переподключиться.'
      );
    });

    webRTCService.on('reconnectFailed', () => {
      Alert.alert(
        'Потеряно соединение',
        'Не удалось восстановить связь с машиной.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Повторить', onPress: () => attemptReconnect() },
        ]
      );
    });
  }, []);

  const connect = useCallback(async (config: WebRTCConfig) => {
    try {
      await webRTCService.connect(config);
    } catch (error) {
      console.error('Failed to connect to car stream:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await webRTCService.disconnect();
      setRemoteStream(null);
      setCarData({
        speed: 0,
        batteryLevel: 0,
      });
    } catch (error) {
      console.error('Error disconnecting from car stream:', error);
    }
  }, []);

  const sendMovement = useCallback((x: number, y: number) => {
    if (!isConnected) return;

    const command: CarControlCommand = {
      type: 'movement',
      data: { x, y },
      timestamp: Date.now(),
    };

    webRTCService.sendControlCommand(command);
  }, [isConnected]);

  const toggleLights = useCallback((enabled: boolean) => {
    if (!isConnected) return;
    webRTCService.toggleLights(enabled);
  }, [isConnected]);

  const soundHorn = useCallback(() => {
    if (!isConnected) return;
    webRTCService.soundHorn();
  }, [isConnected]);

  const attemptReconnect = useCallback(async () => {
    // Get the last used config (you might want to store this in the service)
    const config = {
      carId: 'current-car', // This should be passed in or stored
      signalServerUrl: process.env.EXPO_PUBLIC_WEBRTC_SERVER || 'ws://localhost:8080',
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    try {
      await connect(config);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }, [connect]);

  return {
    // Connection state
    connectionState,
    remoteStream,
    isConnecting,
    isConnected,
    
    // Car data
    carData,
    
    // Control methods
    connect,
    disconnect,
    sendMovement,
    toggleLights,
    soundHorn,
    
    // Stream controls
    isAudioEnabled,
    setIsAudioEnabled,
  };
} 