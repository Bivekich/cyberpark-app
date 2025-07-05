import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  PixelRatio,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Car, CarStatus } from '@/models/Car';
import { BlurView } from 'expo-blur';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';

import { VideoStream } from '@/components/ui/VideoStream';
import { EnhancedJoystick } from '@/components/ui/EnhancedJoystick';
import { useReservation } from '@/contexts/ReservationContext';
import { 
  webRTCService, 
  ConnectionState, 
  CarTelemetryData,
  CarControlCommand 
} from '@/services/webrtc/WebRTCService';

const { width, height } = Dimensions.get('window');
const CONTROL_SIZE = Math.min(width, height) * 0.3;

interface ControlPanelData {
  speed: number;
  batteryLevel: number;
  elapsedTime: number;
  gpsLocation?: { lat: number; lng: number };
  temperature?: number;
}

export default function ControlScreen() {
  const params = useLocalSearchParams();
  const carId = params.id as string;
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { useReservation: useReservationAction } = useReservation();

  // Car and connection state
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Control state
  const [isRideActive, setIsRideActive] = useState(false);
  const [controlData, setControlData] = useState<ControlPanelData>({
    speed: 0,
    batteryLevel: 0,
    elapsedTime: 0,
  });

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [lightsEnabled, setLightsEnabled] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeController();
    setupWebRTCListeners();

    return () => {
      cleanup();
    };
  }, [carId]);

  useEffect(() => {
    if (isLandscape) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      StatusBar.setHidden(true);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      StatusBar.setHidden(false);
    }
  }, [isLandscape]);

  useEffect(() => {
    if (isRideActive) {
      startRideTimer();
    } else {
      stopRideTimer();
    }
  }, [isRideActive]);

  const initializeController = async () => {
    try {
      setIsLoading(true);
      await fetchCarDetails();
      await connectToCarStream();
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к машине');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarDetails = async () => {
    // Mock car details - replace with actual API call
      const mockCar: Car = {
        id: carId || '1',
        name: 'Cyber Racer X1',
        locationId: 'location1',
        status: CarStatus.AVAILABLE,
        batteryLevel: 85,
        maxSpeed: 25,
      image: 'https://via.placeholder.com/400',
        minLevel: 1,
      description: 'High-performance cyber car',
        pricePerMinute: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCar(mockCar);
    setControlData(prev => ({
      ...prev,
      batteryLevel: mockCar.batteryLevel,
    }));
  };

  const connectToCarStream = async () => {
    try {
      const config = {
        carId: carId || '1',
        signalServerUrl: process.env.EXPO_PUBLIC_WEBRTC_SERVER || 'ws://localhost:8080',
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      await webRTCService.connect(config);
    } catch (error) {
      console.error('Failed to connect to car stream:', error);
    }
  };

  const setupWebRTCListeners = () => {
    webRTCService.on('connectionStateChanged', (state: ConnectionState) => {
      setConnectionState(state);
    });

    webRTCService.on('remoteStreamReceived', (stream: MediaStream) => {
      setRemoteStream(stream);
    });

    webRTCService.on('telemetryUpdate', (data: CarTelemetryData) => {
      setControlData(prev => ({
        ...prev,
        speed: data.speed,
        batteryLevel: data.batteryLevel,
        gpsLocation: data.gpsLocation,
        temperature: data.temperature,
      }));
    });

    webRTCService.on('error', (error: any) => {
      console.error('WebRTC error:', error);
      Alert.alert('Ошибка подключения', 'Проблема с видеосвязью');
    });
  };

  const startRideTimer = () => {
    timerRef.current = setInterval(() => {
      setControlData(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);
  };

  const stopRideTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRide = async () => {
    try {
      // Use reservation if available
      if (params.useReservation === 'true') {
        await useReservationAction();
      }

    setIsRideActive(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
    Alert.alert(
        'Поездка началась!',
        `Стоимость: ${car?.pricePerMinute} монет/мин`
    );
    } catch (error) {
      console.error('Failed to start ride:', error);
      Alert.alert('Ошибка', 'Не удалось начать поездку');
    }
  };

  const handleEndRide = () => {
    Alert.alert(
      'Завершить поездку?',
      `Время поездки: ${formatTime(controlData.elapsedTime)}`,
      [
        { text: 'Продолжить', style: 'cancel' },
        {
          text: 'Завершить',
          style: 'destructive',
          onPress: () => {
            setIsRideActive(false);
            setControlData(prev => ({ ...prev, speed: 0, elapsedTime: 0 }));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.back();
          },
        },
      ]
    );
  };

  const handleJoystickMove = (x: number, y: number) => {
    if (!isRideActive || connectionState !== ConnectionState.CONNECTED) return;

    const command: CarControlCommand = {
      type: 'movement',
      data: { x, y },
      timestamp: Date.now(),
    };

    webRTCService.sendControlCommand(command);
  };

  const handleLightsToggle = () => {
    if (!isRideActive) return;
    
    const newState = !lightsEnabled;
    setLightsEnabled(newState);
    webRTCService.toggleLights(newState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHorn = () => {
    if (!isRideActive) return;
    
    webRTCService.soundHorn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (level: number): string => {
    if (level > 50) return '#00FFAA';
    if (level > 20) return '#FF9500';
    return '#FF3B30';
  };

  const cleanup = async () => {
    stopRideTimer();
    await webRTCService.disconnect();
    webRTCService.removeAllListeners();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    StatusBar.setHidden(false);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00FFAA" />
            <Text style={styles.loadingText}>Подключение к машине...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <VideoStream
          stream={remoteStream}
          connectionState={connectionState}
          onFullscreenToggle={() => setIsFullscreen(false)}
          onAudioToggle={() => setIsAudioEnabled(!isAudioEnabled)}
          isFullscreen={true}
          isAudioEnabled={isAudioEnabled}
        />

        {/* Fullscreen Controls Overlay */}
        <View style={styles.fullscreenOverlay}>
          <View style={styles.fullscreenTopBar}>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => setIsFullscreen(false)}
            >
              <Ionicons name="contract" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.fullscreenStats}>
              <Text style={styles.overlayStatText}>
                {controlData.speed} км/ч
              </Text>
              <Text style={styles.overlayStatText}>
                {formatTime(controlData.elapsedTime)}
              </Text>
              <Text style={[styles.overlayStatText, { color: getBatteryColor(controlData.batteryLevel) }]}>
                {Math.round(controlData.batteryLevel)}%
                </Text>
            </View>
          </View>

          <View style={styles.fullscreenBottomBar}>
            <EnhancedJoystick
              size={120}
              onMove={handleJoystickMove}
              disabled={!isRideActive}
            />
            
            <View style={styles.overlayActionButtons}>
              <TouchableOpacity
                style={[styles.overlayActionButton, lightsEnabled && styles.overlayActionButtonActive]}
                onPress={handleLightsToggle}
                disabled={!isRideActive}
              >
                <Ionicons 
                  name="flash" 
                  size={24} 
                  color={lightsEnabled ? "#121220" : "#FFFFFF"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.overlayActionButton}
                onPress={handleHorn}
                disabled={!isRideActive}
              >
                <Ionicons name="volume-high" size={24} color="#FFFFFF" />
              </TouchableOpacity>

            <TouchableOpacity
                style={[styles.overlayActionButton, styles.endRideOverlayButton]}
              onPress={handleEndRide}
            >
                <Ionicons name="stop" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Управление',
          headerShown: !isFullscreen,
        }}
      />
      <StatusBar hidden={isFullscreen} />

      <View style={[styles.content, isLandscape && styles.landscapeContent]}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#00FFAA" size="large" />
            <Text style={styles.loadingText}>Подключение к машине...</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (isRideActive) {
                    handleEndRide();
                  } else {
                    router.back();
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerInfo}>
                <Text style={styles.carName}>{car?.name}</Text>
                {isRideActive && (
                  <Text style={styles.rideStatus}>
                    {formatTime(controlData.elapsedTime)} • {Math.round(controlData.speed)} км/ч
                  </Text>
                )}
              </View>

              <View style={styles.batteryIndicator}>
                <Ionicons
                  name="battery-half" 
                  size={20} 
                  color={getBatteryColor(controlData.batteryLevel)} 
                />
                <Text style={[styles.batteryText, { color: getBatteryColor(controlData.batteryLevel) }]}>
                  {Math.round(controlData.batteryLevel)}%
                </Text>
              </View>
            </View>

            {/* Main Content */}
            <View style={[styles.videoSection, isLandscape && styles.videoSectionLandscape]}>
              <VideoStream
                stream={remoteStream}
                connectionState={connectionState}
                onFullscreenToggle={() => setIsFullscreen(true)}
                onAudioToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                isAudioEnabled={isAudioEnabled}
                isLoading={connectionState === ConnectionState.CONNECTING}
              />
            </View>

            {/* Controls Section */}
            <View style={[styles.controlsSection, isLandscape && styles.controlsSectionLandscape]}>
              {!isRideActive ? (
                <View style={styles.startRideSection}>
                  <Text style={styles.startRideTitle}>
                    Готовы к поездке?
                  </Text>
                  <Text style={styles.startRideSubtitle}>
                    Стоимость: {car?.pricePerMinute} монет/мин
                  </Text>
                  <TouchableOpacity
                    style={styles.startRideButton}
                    onPress={handleStartRide}
                  >
                    <Ionicons name="play" size={24} color="#121220" />
                    <Text style={styles.startRideButtonText}>Начать поездку</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.activeControlsSection}>
                  {/* Joystick */}
                  <View style={styles.joystickSection}>
                    <EnhancedJoystick
                      size={isLandscape ? 120 : 160}
                      onMove={handleJoystickMove}
                      disabled={!isRideActive || connectionState !== ConnectionState.CONNECTED}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, lightsEnabled && styles.actionButtonActive]}
                      onPress={handleLightsToggle}
                    >
                      <Ionicons 
                        name="flash" 
                        size={20} 
                        color={lightsEnabled ? "#121220" : "#FFFFFF"} 
                      />
                      <Text style={[styles.actionButtonText, lightsEnabled && styles.actionButtonTextActive]}>
                        Фары
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleHorn}
                    >
                      <Ionicons name="volume-high" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Сигнал</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.endRideButton]}
                      onPress={handleEndRide}
                    >
                      <Ionicons name="stop" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Завершить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  carName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideStatus: {
    color: '#9F9FAC',
    fontSize: 14,
    marginTop: 2,
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  landscapeContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  videoSection: {
    flex: 2,
    marginBottom: 20,
  },
  videoSectionLandscape: {
    flex: 3,
    marginBottom: 0,
    marginRight: 16,
  },
  controlsSection: {
    flex: 1,
  },
  controlsSectionLandscape: {
    flex: 2,
  },
  startRideSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  startRideTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  startRideSubtitle: {
    color: '#9F9FAC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  startRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FFAA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startRideButtonText: {
    color: '#121220',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeControlsSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  joystickSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  actionButtonActive: {
    backgroundColor: '#00FFAA',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actionButtonTextActive: {
    color: '#121220',
  },
  endRideButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  fullscreenTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  fullscreenBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  overlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 16,
  },
  overlayStatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overlayActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  overlayActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayActionButtonActive: {
    backgroundColor: '#00FFAA',
  },
  endRideOverlayButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
});
