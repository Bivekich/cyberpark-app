import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  useWindowDimensions,
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
import { useFocusEffect } from '@react-navigation/native';

import { VideoStream } from '@/components/ui/VideoStream';
import { EnhancedJoystick } from '@/components/ui/EnhancedJoystick';
import { useReservation } from '@/contexts/ReservationContext';
import { 
  webRTCService, 
  ConnectionState, 
  CarTelemetryData,
  CarControlCommand 
} from '@/services/webrtc/WebRTCService';
import { mockWebRTCService } from '@/services/webrtc/MockWebRTCService';
import { carsService } from '@/services/api/cars';
import { balanceService } from '@/services/api/balance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

// Use mock service for testing - toggle this for production
const USE_MOCK_SERVICE = true;
const activeWebRTCService = USE_MOCK_SERVICE ? mockWebRTCService : webRTCService;

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

  // Balance tracking states
  const [userBalance, setUserBalance] = useState<number>(0);
  const [maxRideTime, setMaxRideTime] = useState<number>(0); // максимальное время поездки в секундах
  const [showMinuteDeduction, setShowMinuteDeduction] = useState<boolean>(false);
  
  // UI state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [lightsEnabled, setLightsEnabled] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Force landscape orientation and hide status bar when screen loads
  useFocusEffect(
    React.useCallback(() => {
      const setupFullscreen = async () => {
        try {
          // Переключаемся в ландшафт
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          console.log('Screen locked to landscape');
        } catch (error) {
          console.error('Error setting up fullscreen:', error);
        }
      };

      const cleanup = async () => {
        try {
          // Возвращаем исходную ориентацию
          await ScreenOrientation.unlockAsync();
          console.log('Screen orientation restored');
        } catch (error) {
          console.error('Error restoring orientation:', error);
        }
      };

      setupFullscreen();

      return cleanup;
    }, [])
  );

  useEffect(() => {
    initializeController();
    setupWebRTCListeners();

    return () => {
      cleanup();
    };
  }, [carId]);

  useEffect(() => {
    if (isRideActive) {
      startRideTimer();
    } else {
      stopRideTimer();
    }
  }, [isRideActive]);

  // Обновляем максимальное время поездки когда загружаются данные машины
  useEffect(() => {
    if (car && userBalance > 0) {
      const maxMinutes = Math.floor(userBalance / car.pricePerMinute);
      setMaxRideTime(maxMinutes * 60);
      console.log(`Updated max ride time: ${maxMinutes} minutes for balance ${userBalance}`);
    }
  }, [car, userBalance]);

  const initializeController = async () => {
    try {
      setIsLoading(true);
      await fetchCarDetails();
      await fetchUserBalance();
      await connectToCarStream();
    } catch (error) {
      console.error('Failed to initialize controller:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к машине');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarDetails = async () => {
    try {
      const fetchedCar = await carsService.getCarById(carId);
      if (fetchedCar) {
        setCar(fetchedCar);
        setControlData(prev => ({
          ...prev,
          batteryLevel: fetchedCar.batteryLevel,
        }));
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const balance = await balanceService.getUserBalance();
      setUserBalance(balance);
      
      // Рассчитываем максимальное время поездки на основе баланса
      if (car) {
        const maxMinutes = Math.floor(balance / car.pricePerMinute);
        setMaxRideTime(maxMinutes * 60); // конвертируем в секунды
        console.log(`User balance: ${balance}, max ride time: ${maxMinutes} minutes`);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
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

      await activeWebRTCService.connect(config);
    } catch (error) {
      console.error('Failed to connect to car stream:', error);
    }
  };

  const setupWebRTCListeners = () => {
    activeWebRTCService.on('connectionStateChanged', (state: ConnectionState) => {
      setConnectionState(state);
    });

    activeWebRTCService.on('remoteStreamReceived', (stream: MediaStream) => {
      setRemoteStream(stream);
    });

    activeWebRTCService.on('telemetryUpdate', (data: CarTelemetryData) => {
      setControlData(prev => ({
        ...prev,
        speed: data.speed,
        batteryLevel: data.batteryLevel,
        gpsLocation: data.gpsLocation,
        temperature: data.temperature,
      }));
    });

    activeWebRTCService.on('error', (error: any) => {
      console.error('WebRTC error:', error);
      Alert.alert('Ошибка подключения', 'Проблема с видеосвязью');
    });
  };

  const startRideTimer = () => {
    if (rideTimerRef.current) return;

    rideTimerRef.current = setInterval(async () => {
      setControlData(prev => {
        const newElapsedTime = prev.elapsedTime + 1;
        
        // Deduct balance every minute (60 seconds)
        if (newElapsedTime % 60 === 0 && car) {
          const minutesCompleted = Math.floor(newElapsedTime / 60);
          console.log(`Completed ${minutesCompleted} minute(s), deducting ${car.pricePerMinute} coins`);
          
          // Deduct coins for this minute
          deductMinuteBalance(car.pricePerMinute, car.name, minutesCompleted);
        }
        
        // Check if user has enough balance for the next minute
        if (userBalance <= 0) {
          console.log('Balance exhausted, stopping ride');
          handleForceEndRide();
          return prev;
        }
        
        return { ...prev, elapsedTime: newElapsedTime };
      });
    }, 1000);
  };

  const stopRideTimer = () => {
    if (rideTimerRef.current) {
      clearInterval(rideTimerRef.current);
      rideTimerRef.current = null;
    }
  };

  const handleStartRide = async () => {
    try {
      // Проверяем баланс перед началом поездки
      const currentBalance = await balanceService.getUserBalance();
      if (!car || currentBalance < car.pricePerMinute) {
        Alert.alert(
          'Недостаточно средств',
          `Для начала поездки требуется минимум ${car?.pricePerMinute || 0} монет. Ваш баланс: ${currentBalance} монет.`,
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Пополнить', onPress: () => router.push('/(app)/profile/deposit') }
          ]
        );
        return;
      }

      // Если есть активная резервация для этой машины, используем её
      // Это переведет статус машины из "reserved" в "in_use" и остановит таймер резервации
      await useReservationAction();

      setIsRideActive(true);
      setControlData(prev => ({ ...prev, elapsedTime: 0 }));
      startRideTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('Ride started - reservation consumed');
    } catch (error) {
      console.error('Error starting ride:', error);
      Alert.alert('Ошибка', 'Не удалось начать поездку');
    }
  };

  const handleEndRide = () => {
    const totalCost = Math.ceil(controlData.elapsedTime / 60) * (car?.pricePerMinute || 0);
    
    Alert.alert(
      'Завершить поездку?',
      `Время: ${formatTime(controlData.elapsedTime)}\nСтоимость: ${totalCost} монет`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить',
          style: 'destructive',
          onPress: () => finishRide(),
        },
      ]
    );
  };

  // Принудительное завершение поездки при исчерпании баланса
  const handleForceEndRide = () => {
    Alert.alert(
      'Баланс исчерпан',
      'Ваш баланс недостаточен для продолжения поездки. Списание происходит каждую минуту. Поездка будет автоматически завершена.',
      [
        {
          text: 'OK',
          onPress: () => finishRide(),
        },
      ]
    );
  };

  const finishRide = async () => {
    try {
      const duration = controlData.elapsedTime;
      const totalCost = Math.ceil(duration / 60) * (car?.pricePerMinute || 0);
      
      // Check if there's any remaining partial minute to charge
      const remainingSeconds = duration % 60;
      if (remainingSeconds > 0 && car) {
        // Charge for partial minute at the end
        const partialMinuteCost = car.pricePerMinute;
        const result = await balanceService.deductForRide(partialMinuteCost, car.name, remainingSeconds);
        
        if (result.success) {
          setUserBalance(result.newBalance);
          console.log(`Final partial minute (${remainingSeconds}s): Deducted ${partialMinuteCost} coins`);
        }
      }

      // Release the car unit back to available status
      const finishResult = await carsService.finishRide();
      if (finishResult.success) {
        console.log('Car unit released successfully:', finishResult.message);
      } else {
        console.error('Failed to release car unit:', finishResult.message);
        // Still show completion dialog even if car release failed
      }

      const finalBalance = userBalance;
      
      Alert.alert(
        'Поездка завершена',
        `Общее время: ${formatTime(duration)}\nВсего списано: ${totalCost} монет\nОстаток: ${finalBalance} монет`,
        [{ text: 'OK' }]
      );

      setIsRideActive(false);
      setControlData(prev => ({ ...prev, elapsedTime: 0 }));
      stopRideTimer();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Возвращаемся назад через секунду
      setTimeout(() => {
        router.back();
      }, 1000);
      
    } catch (error) {
      console.error('Error finishing ride:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при завершении поездки');
    }
  };

  const handleExit = () => {
    if (isRideActive) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleJoystickMove = (x: number, y: number) => {
    const command: CarControlCommand = {
      type: 'movement',
      data: { x, y },
      timestamp: Date.now(),
    };
    
    activeWebRTCService.sendControlCommand(command);
    
    // Light haptic feedback for steering
    if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) {
      Haptics.selectionAsync();
    }
  };

  const handleLightsToggle = () => {
    setLightsEnabled(!lightsEnabled);
    const command: CarControlCommand = {
      type: 'light',
      data: { enabled: !lightsEnabled },
      timestamp: Date.now(),
    };
    activeWebRTCService.sendControlCommand(command);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHorn = () => {
    const command: CarControlCommand = {
      type: 'horn',
      data: {},
      timestamp: Date.now(),
    };
    activeWebRTCService.sendControlCommand(command);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (level: number): string => {
    if (level <= 20) return '#FF3B30';
    if (level <= 50) return '#FF9500';
    return '#00FFAA';
  };

  const deductMinuteBalance = async (amount: number, carName: string, minute: number) => {
    try {
      const result = await balanceService.deductForRide(amount, carName, 60); // 60 seconds = 1 minute
      
      if (result.success) {
        setUserBalance(result.newBalance);
        console.log(`Minute ${minute}: Deducted ${amount} coins, remaining balance: ${result.newBalance}`);
        
        // Show brief deduction notification
        setShowMinuteDeduction(true);
        setTimeout(() => setShowMinuteDeduction(false), 2000); // Hide after 2 seconds
        
        // Update max ride time based on new balance
        if (car) {
          const maxMinutes = Math.floor(result.newBalance / car.pricePerMinute);
          setMaxRideTime(maxMinutes * 60);
        }
        
        // Light haptic feedback for balance deduction
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        console.error('Failed to deduct minute balance:', result.error);
        // Force stop the ride if we can't deduct balance
        handleForceEndRide();
      }
    } catch (error) {
      console.error('Error deducting minute balance:', error);
      handleForceEndRide();
    }
  };

  const cleanup = async () => {
    try {
      stopRideTimer();
      await activeWebRTCService.disconnect();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFAA" />
        <Text style={styles.loadingText}>Подключение к машине...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Video Stream Background */}
        <View style={styles.videoContainer}>
          {remoteStream ? (
            <VideoStream 
              stream={remoteStream} 
              connectionState={connectionState}
            />
          ) : (
            <LinearGradient
              colors={['#121220', '#1A1A2E']}
              style={styles.videoPlaceholder}
            >
              <Ionicons name="videocam-off" size={64} color="#666" />
              <Text style={styles.videoPlaceholderText}>
                {connectionState === ConnectionState.CONNECTING 
                  ? 'Подключение к камере...' 
                  : 'Камера недоступна'}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Top HUD Overlay */}
        <View style={styles.topHUD}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <BlurView intensity={80} style={styles.hudButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.carInfo}>
            <BlurView intensity={80} style={styles.carInfoContainer}>
              <Text style={styles.carName}>{car?.name}</Text>
              <View style={styles.batteryIndicator}>
                <Ionicons name="battery-full" size={16} color={getBatteryColor(controlData.batteryLevel)} />
                <Text style={[styles.batteryText, { color: getBatteryColor(controlData.batteryLevel) }]}>
                  {controlData.batteryLevel}%
                </Text>
              </View>
            </BlurView>
          </View>

          {isRideActive && (
            <View style={styles.rideTimer}>
              <BlurView intensity={80} style={styles.timerContainer}>
                <Ionicons name="timer" size={16} color="#00FFAA" />
                <Text style={styles.timerText}>{formatTime(controlData.elapsedTime)}</Text>
                <Text style={styles.speedText}>{controlData.speed} км/ч</Text>
              </BlurView>
            </View>
          )}

          {/* Balance Timer - показывает оставшееся время поездки */}
          {isRideActive && car && (
            <View style={styles.balanceTimer}>
              <BlurView intensity={80} style={styles.timerContainer}>
                <Ionicons name="wallet" size={16} color="#FFCC00" />
                <Text style={[styles.timerText, { color: '#FFCC00' }]}>
                  {Math.floor(userBalance / car.pricePerMinute)} мин
                </Text>
                <Text style={[styles.speedText, { color: '#FFCC00' }]}>
                  осталось
                </Text>
              </BlurView>
            </View>
          )}
        </View>

        {/* Control Overlay */}
        <View style={styles.controlsOverlay}>
          {/* Left Side - Joystick */}
          <View style={styles.leftControls}>
            <View style={styles.joystick}>
              <EnhancedJoystick
                size={120}
                onMove={handleJoystickMove}
              />
            </View>
            <Text style={styles.joystickLabel}>Управление</Text>
          </View>

          {/* Right Side - Action Buttons */}
          <View style={styles.rightControls}>
            {!isRideActive ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
                <LinearGradient
                  colors={['#00FFAA', '#00CC88']}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="play" size={32} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>СТАРТ</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.endButton} onPress={handleEndRide}>
                  <LinearGradient
                    colors={['#FF3B30', '#CC0000']}
                    style={styles.endButtonGradient}
                  >
                    <Ionicons name="stop" size={24} color="#FFFFFF" />
                    <Text style={styles.endButtonText}>СТОП</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.controlButton, lightsEnabled && styles.controlButtonActive]} 
                  onPress={handleLightsToggle}
                >
                  <BlurView intensity={80} style={styles.controlButtonInner}>
                    <Ionicons 
                      name={lightsEnabled ? "bulb" : "bulb-outline"} 
                      size={24} 
                      color={lightsEnabled ? "#FFD700" : "#FFFFFF"} 
                    />
                  </BlurView>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={handleHorn}>
                  <BlurView intensity={80} style={styles.controlButtonInner}>
                    <Ionicons name="megaphone" size={24} color="#FFFFFF" />
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} style={styles.modal}>
              <Text style={styles.modalTitle}>Завершить поездку?</Text>
              <Text style={styles.modalText}>
                Время: {formatTime(controlData.elapsedTime)}{'\n'}
                Стоимость: {Math.ceil(controlData.elapsedTime / 60) * (car?.pricePerMinute || 0)} монет
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => setShowExitConfirm(false)}
                >
                  <Text style={styles.modalButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]} 
                  onPress={() => {
                    setShowExitConfirm(false);
                    handleEndRide();
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>
                    Завершить
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}

        {/* Minute Deduction Notification */}
        {showMinuteDeduction && car && (
          <View style={styles.deductionNotification}>
            <BlurView intensity={80} style={styles.deductionContainer}>
              <Ionicons name="remove-circle" size={20} color="#FF9500" />
              <Text style={styles.deductionText}>
                -{car.pricePerMinute} монет
              </Text>
            </BlurView>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121220',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoStream: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  topHUD: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  exitButton: {
    width: 50,
    height: 50,
  },
  hudButton: {
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carInfo: {
    flex: 1,
    marginHorizontal: 20,
  },
  carInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  rideTimer: {
    width: 120,
  },
  timerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFAA',
    marginLeft: 6,
    marginRight: 8,
  },
  speedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  balanceTimer: {
    width: 120,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 10,
  },
  leftControls: {
    alignItems: 'center',
  },
  joystick: {
    marginBottom: 8,
  },
  joystickLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  rightControls: {
    alignItems: 'center',
  },
  startButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  startButtonGradient: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  actionButtons: {
    alignItems: 'center',
    gap: 12,
  },
  endButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  endButtonGradient: {
    flex: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  controlButtonActive: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  controlButtonInner: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 100,
  },
  modal: {
    margin: 40,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonPrimary: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
  },
  deductionNotification: {
    position: 'absolute',
    top: 100, // Adjust as needed, above the HUD
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  deductionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  deductionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 8,
  },
});
