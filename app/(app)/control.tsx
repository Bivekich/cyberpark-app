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

const { width, height } = Dimensions.get('window');
const CONTROL_SIZE = Math.min(width, height) * 0.3;

// Мок-компонент для имитации джойстика
function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const baseSize = 180;
  const movementRadius = baseSize / 2 - 30;

  const normalizeJoystickValue = (value: number) => {
    return parseFloat((value / movementRadius).toFixed(2));
  };

  const handleMove = (x: number, y: number) => {
    // Ограничиваем движение джойстика в пределах круга
    const distance = Math.sqrt(x * x + y * y);

    if (distance > movementRadius) {
      const angle = Math.atan2(y, x);
      x = movementRadius * Math.cos(angle);
      y = movementRadius * Math.sin(angle);
    }

    setPosition({ x, y });

    // Нормализуем значения для API (-1 до 1)
    const normalizedX = normalizeJoystickValue(x);
    const normalizedY = normalizeJoystickValue(y);

    onMove(normalizedX, normalizedY);
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        handleMove(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: () => {
        // Возвращаем джойстик в центр при отпускании
        setPosition({ x: 0, y: 0 });
        onMove(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.joystickContainer}>
      <View style={styles.joystickBase}>
        <View
          style={[
            styles.joystickThumb,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      <View style={styles.joystickControls}>
        <TouchableOpacity
          style={styles.joystickArrow}
          onPress={() => handleMove(0, -movementRadius)}
        >
          <Ionicons name="chevron-up" size={24} color="#007AFF" />
        </TouchableOpacity>

        <View style={styles.joystickMiddleRow}>
          <TouchableOpacity
            style={styles.joystickArrow}
            onPress={() => handleMove(-movementRadius, 0)}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joystickCenter}
            onPress={() => handleMove(0, 0)}
          >
            <Ionicons name="stop" size={24} color="#FF3B30" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joystickArrow}
            onPress={() => handleMove(movementRadius, 0)}
          >
            <Ionicons name="chevron-forward" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.joystickArrow}
          onPress={() => handleMove(0, movementRadius)}
        >
          <Ionicons name="chevron-down" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ControlScreen() {
  const params = useLocalSearchParams();
  const carId = params.id as string;
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenting, setIsRenting] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rideActivity, setRideActivity] = useState<string[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Автоматически устанавливаем горизонтальную ориентацию при входе на экран
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    // Скрываем статус-бар для полноэкранного режима
    StatusBar.setHidden(true);

    fetchCarDetails();
    if (params.action === 'rent') {
      handleRentCar();
    }

    return () => {
      // Восстанавливаем портретную ориентацию и статус-бар при выходе с экрана
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      StatusBar.setHidden(false);
    };
  }, [carId]);

  useEffect(() => {
    if (isRenting) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);

        // Симуляция изменения скорости на основе направления джойстика
        const targetSpeed =
          Math.sqrt(direction.x * direction.x + direction.y * direction.y) * 60;
        setSpeed((prev) => {
          const diff = targetSpeed - prev;
          return Math.max(0, prev + diff * 0.1);
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isRenting, direction]);

  useEffect(() => {
    let batteryTimer: NodeJS.Timeout;

    if (isRideActive) {
      // Таймер для симуляции разрядки батареи
      batteryTimer = setInterval(() => {
        if (speed > 0) {
          setBatteryLevel((prev) => Math.max(0, prev - speed / 100));
        }
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (batteryTimer) clearInterval(batteryTimer);
    };
  }, [isRideActive, speed]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      // В реальном приложении здесь должен быть API-запрос
      // Заглушка для демонстрации
      const mockCar: Car = {
        id: carId || '1',
        name: 'Cyber Racer X1',
        locationId: 'location1',
        status: CarStatus.AVAILABLE,
        batteryLevel: 85,
        maxSpeed: 25,
        image: 'https://via.placeholder.com/150',
        minLevel: 1,
        description: 'Быстрый гоночный кибермобиль для новичков',
        pricePerMinute: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCar(mockCar);
      setBatteryLevel(mockCar.batteryLevel);
    } catch (error) {
      console.error('Error fetching car details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о машине');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRentCar = () => {
    if (!car) return;

    setIsRenting(true);
    setElapsedTime(0);
    setSpeed(0);
    setIsRideActive(true);
    setIsFullscreen(true);
    Alert.alert(
      'Машина арендована',
      'Теперь вы можете управлять машиной. Стоимость: 10 монет/мин'
    );
  };

  const handleEndRide = () => {
    Alert.alert(
      'Завершить поездку',
      'Вы уверены, что хотите завершить поездку?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Завершить',
          style: 'destructive',
          onPress: () => {
            setIsRideActive(false);
            setIsFullscreen(false);
            const cost =
              Math.ceil(elapsedTime / 60) * (car?.pricePerMinute || 10);
            Alert.alert(
              'Поездка завершена',
              `Длительность: ${formatTime(
                elapsedTime
              )}\nСтоимость: ${cost} монет`,
              [{ text: 'OK', onPress: () => router.push('/') }]
            );
            setElapsedTime(0);
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleControlPress = (x: number, y: number) => {
    if (!isRideActive) return;

    setDirection({ x, y });

    // Рассчитываем скорость на основе позиции
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 1; // Максимальное расстояние от центра (нормализованное)
    const speedPercentage = Math.min(distance / maxDistance, 1);

    const newSpeed = Math.round(speedPercentage * (car?.maxSpeed || 25));
    setSpeed(newSpeed);
  };

  const handleJoystickMove = (x: number, y: number) => {
    setDirection({ x, y });

    // Управление скоростью (упрощенно, только вперед-назад)
    const newSpeed = -y * (car?.maxSpeed || 0); // отрицательный Y = вперед
    setSpeed(Math.round(Math.max(0, newSpeed))); // не позволяем скорости быть отрицательной

    // Имитация записи в лог при значительных изменениях
    if (Math.abs(x) > 0.8 && Date.now() % 5 === 0) {
      setRideActivity((prev) => [
        `${new Date().toLocaleTimeString()} - Поворот ${
          x > 0 ? 'направо' : 'налево'
        }`,
        ...prev,
      ]);
    }

    if (Math.abs(newSpeed - speed) > 5) {
      setRideActivity((prev) => [
        `${new Date().toLocaleTimeString()} - Изменение скорости: ${Math.round(
          newSpeed
        )} км/ч`,
        ...prev,
      ]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderControls = () => {
    if (!isRideActive) {
      return (
        <TouchableOpacity
          style={styles.rentButton}
          onPress={handleRentCar}
          disabled={isRenting}
        >
          {isRenting ? (
            <ActivityIndicator color="#121220" />
          ) : (
            <Text style={styles.rentButtonText}>Арендовать машину</Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.controlPanelContainer}>
        <TouchableOpacity
          style={styles.fullscreenToggle}
          onPress={toggleFullscreen}
        >
          <Ionicons
            name={isFullscreen ? 'contract' : 'expand'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.statsOverlay}>
          <View style={styles.statItem}>
            <Ionicons name="speedometer" size={20} color="#00FFAA" />
            <Text style={styles.statValue}>{speed} км/ч</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#00FFAA" />
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={20} color="#00FFAA" />
            <Text style={styles.statValue}>{Math.round(batteryLevel)}%</Text>
          </View>
        </View>

        <View style={styles.joystickContainer}>
          <View style={styles.joystickBase}>
            <View
              style={[
                styles.joystickThumb,
                {
                  transform: [
                    { translateX: direction.x * (CONTROL_SIZE / 2 - 30) },
                    { translateY: direction.y * (CONTROL_SIZE / 2 - 30) },
                  ],
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.endRideButton} onPress={handleEndRide}>
          <Text style={styles.endRideButtonText}>Завершить поездку</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00FFAA" />
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (isRideActive && isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        {/* Видеопоток на весь экран */}
        <View style={styles.videoStreamContainer}>
          <BlurView intensity={60} tint="dark" style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={48} color="#3A3A4C" />
            <Text style={styles.videoPlaceholderText}>
              Видеопоток будет доступен в следующей версии
            </Text>
          </BlurView>
        </View>

        {/* Панель управления поверх видео */}
        <View style={styles.overlayControlPanel}>
          {/* Верхняя панель с информацией */}
          <View style={styles.topOverlayPanel}>
            <TouchableOpacity
              style={styles.fullscreenToggle}
              onPress={toggleFullscreen}
            >
              <Ionicons name="contract" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.statsOverlay}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={20} color="#00FFAA" />
                <Text style={styles.statValue}>{speed} км/ч</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color="#00FFAA" />
                <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flash" size={20} color="#00FFAA" />
                <Text style={styles.statValue}>
                  {Math.round(batteryLevel)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Нижняя панель с элементами управления */}
          <View style={styles.bottomOverlayPanel}>
            <View style={styles.joystickContainer}>
              <View style={styles.joystickBase}>
                <View
                  style={[
                    styles.joystickThumb,
                    {
                      transform: [
                        { translateX: direction.x * (CONTROL_SIZE / 2 - 30) },
                        { translateY: direction.y * (CONTROL_SIZE / 2 - 30) },
                      ],
                    },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.endRideButton}
              onPress={handleEndRide}
            >
              <Text style={styles.endRideButtonText}>Завершить поездку</Text>
            </TouchableOpacity>
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
            {/* Верхняя панель */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (isRideActive) {
                    Alert.alert(
                      'Завершить поездку?',
                      'Вы уверены, что хотите завершить поездку?',
                      [
                        { text: 'Отмена', style: 'cancel' },
                        {
                          text: 'Завершить',
                          style: 'destructive',
                          onPress: () => {
                            setIsRideActive(false);
                            setIsRenting(false);
                            router.back();
                          },
                        },
                      ]
                    );
                  } else {
                    router.back();
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.carInfo}>
                <Text style={styles.carName}>{car?.name}</Text>
                {isRideActive && (
                  <Text style={styles.rideTimeText}>
                    {formatTime(elapsedTime)} • {Math.round(speed)} км/ч
                  </Text>
                )}
              </View>

              <View style={styles.batteryContainer}>
                <Ionicons
                  name={getBatteryIcon(batteryLevel)}
                  size={18}
                  color={batteryLevel > 20 ? '#00FFAA' : '#FF3B30'}
                />
                <Text
                  style={[
                    styles.batteryText,
                    batteryLevel <= 20 && styles.lowBatteryText,
                  ]}
                >
                  {Math.round(batteryLevel)}%
                </Text>
              </View>
            </View>

            {/* Основной контент (джойстик и камера) */}
            <View style={styles.mainContent}>
              <View style={styles.cameraContainer}>
                <View style={styles.cameraPlaceholder}>
                  <Text style={styles.cameraText}>
                    {isRideActive
                      ? 'Трансляция с камеры машины'
                      : "Нажмите 'Начать поездку', чтобы управлять машиной"}
                  </Text>
                </View>
              </View>

              <View style={styles.controlsContainer}>
                {renderControls()}

                {!isRideActive && (
                  <TouchableOpacity
                    style={styles.startRideButton}
                    onPress={handleRentCar}
                  >
                    <Text style={styles.startRideButtonText}>
                      Начать поездку
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

// Определяем иконку батареи в зависимости от уровня заряда
function getBatteryIcon(level: number) {
  if (level <= 20) return 'battery-dead';
  if (level <= 40) return 'battery-half';
  if (level <= 60) return 'battery-half';
  if (level <= 80) return 'battery-charging';
  return 'battery-full';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  landscapeContent: {
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rideTimeText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginTop: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 14,
    color: '#00FFAA',
    marginLeft: 4,
  },
  lowBatteryText: {
    color: '#FF3B30',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  cameraContainer: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 16,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startRideButton: {
    backgroundColor: '#00FFAA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  startRideButtonText: {
    color: '#121220',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoStreamContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
  },
  overlayControlPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  topOverlayPanel: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  bottomOverlayPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  statsOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  fullscreenToggle: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  joystickContainer: {
    width: 180,
    height: 180,
  },
  joystickBase: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#00FFAA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FFAA',
    shadowColor: '#00FFAA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  endRideButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: 180,
  },
  endRideButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rentButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
  videoStream: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  speedometer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  speedUnit: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  batteryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  controlPanelContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.4,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joystickMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  joystickArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 20,
  },
  joystickCenter: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 20,
  },
  joystickControls: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
