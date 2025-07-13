import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Car, CarStatus } from '@/models/Car';
import { carsService } from '@/services/api/cars';
import { useReservation } from '@/contexts/ReservationContext';
import { ReservationTimer } from '@/components/ui/ReservationTimer';
import { balanceService } from '@/services/api/balance';
import { usersApi } from '@/services/api/users';

export default function CarDetailsScreen() {
  const params = useLocalSearchParams();
  const carId = params.id as string;
  const useReservationParam = params.useReservation as string;
  const { activeReservation, useReservation: useReservationAction, createReservation, cancelReservation } = useReservation();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationImages, setLocationImages] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<number>(1);

  useEffect(() => {
    if (carId) {
      fetchCarDetails();
      fetchUserLevel();
    }
  }, [carId]);

  const fetchUserLevel = async () => {
    try {
      const levelData = await usersApi.getUserLevel();
      setUserLevel(levelData.level);
    } catch (error) {
      console.error('Error fetching user level:', error);
    }
  };

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real car data from backend
      const fetchedCar = await carsService.getCarById(carId);
      
      if (!fetchedCar) {
        Alert.alert('Ошибка', 'Машина не найдена');
        router.back();
        return;
      }

      // Mock location images for now (can be added to backend later)
      const mockLocationImages = [
        'https://via.placeholder.com/300?text=Location+1',
        'https://via.placeholder.com/300?text=Location+2',
        'https://via.placeholder.com/300?text=Location+3',
      ];

      setCar(fetchedCar);
      setLocationImages(mockLocationImages);
    } catch (error) {
      console.error('Error fetching car details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о машине');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: CarStatus): string => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'Доступна';
      case CarStatus.RESERVED:
        return 'Зарезервирована';
      case CarStatus.BUSY:
        return 'Занята';
      case CarStatus.CHARGING:
        return 'Заряжается';
      case CarStatus.MAINTENANCE:
        return 'На обслуживании';
      case CarStatus.OFFLINE:
        return 'Не в сети';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: CarStatus): string => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return '#00FFAA';
      case CarStatus.RESERVED:
        return '#FFCC00';
      case CarStatus.BUSY:
        return '#FF9500';
      case CarStatus.CHARGING:
        return '#00C8FF';
      case CarStatus.MAINTENANCE:
        return '#FF3B30';
      case CarStatus.OFFLINE:
        return '#8E8E93';
      default:
        return '#9F9FAC';
    }
  };

  const handleRentCar = () => {
    if (!car) return;

    router.push({
      pathname: '/control',
      params: { id: car.id, action: 'rent' },
    });
  };

  const handleReserveCar = async () => {
    if (!car) return;

    try {
      // Check user level first
      const hasMinimumLevel = userLevel >= car.minLevel;
      if (!hasMinimumLevel) {
        Alert.alert(
          'Недостаточный уровень',
          `Для этой машины требуется уровень ${car.minLevel}. Ваш текущий уровень: ${userLevel}. Тратьте монеты, чтобы повысить уровень!`,
          [{ text: 'Понятно', style: 'default' }]
        );
        return;
      }

      // Check if user has sufficient balance (minimum 5 minutes worth)
      const userBalance = await balanceService.getUserBalance();
      const minimumRequired = car.pricePerMinute * 5; // 5 minutes minimum
      
      if (userBalance < minimumRequired) {
        Alert.alert(
          'Недостаточно средств',
          `Резервация бесплатна, но для поездки требуется минимум ${minimumRequired} монет (5 минут). Ваш баланс: ${userBalance} монет.`,
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Пополнить', 
              onPress: () => router.push('/(app)/profile/deposit')
            }
          ]
        );
        return;
      }

      const success = await createReservation(car.id);
      if (success) {
        // Контекст уже показывает сообщение, просто возвращаемся назад
        router.back();
      }
    } catch (error) {
      console.error('Failed to reserve car:', error);
      Alert.alert('Ошибка', 'Не удалось зарезервировать машину');
    }
  };

  const handleStartImmediately = async () => {
    if (!car) return;

    try {
      // Check user level first
      const hasMinimumLevel = userLevel >= car.minLevel;
      if (!hasMinimumLevel) {
        Alert.alert(
          'Недостаточный уровень',
          `Для этой машины требуется уровень ${car.minLevel}. Ваш текущий уровень: ${userLevel}. Тратьте монеты, чтобы повысить уровень!`,
          [{ text: 'Понятно', style: 'default' }]
        );
        return;
      }

      // Check if user has sufficient balance (minimum 5 minutes worth for immediate start)
      const userBalance = await balanceService.getUserBalance();
      const minimumRequired = car.pricePerMinute * 5; // 5 minutes minimum for immediate start
      
      if (userBalance < minimumRequired) {
        Alert.alert(
          'Недостаточно средств',
          `Для немедленного старта требуется минимум ${minimumRequired} монет (5 минут поездки). Ваш баланс: ${userBalance} монет.`,
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Пополнить', 
              onPress: () => router.push('/(app)/profile/deposit')
            }
          ]
        );
        return;
      }

      router.push({
        pathname: '/control',
        params: { id: car.id, action: 'start_immediately' },
      });
    } catch (error) {
      console.error('Error starting car immediately:', error);
      Alert.alert('Ошибка', 'Не удалось начать поездку');
    }
  };

  const renderLocationImage = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.locationImage}
      resizeMode="cover"
    />
  );

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

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Детали машины</Text>
            <View style={styles.placeholder} />
          </View>

          <Image
            source={{ uri: car?.image }}
            style={styles.carImage}
            resizeMode="cover"
          />

          <View style={styles.contentContainer}>
            <View style={styles.carHeaderRow}>
              <Text style={styles.carName}>{car?.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: `${getStatusColor(
                      car?.status as CarStatus
                    )}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(car?.status as CarStatus) },
                  ]}
                >
                  {getStatusText(car?.status as CarStatus)}
                </Text>
              </View>
            </View>

            <Text style={styles.carDescription}>{car?.description}</Text>

            <View style={styles.specsContainer}>
              <Text style={styles.specsTitle}>Характеристики</Text>
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={18}
                    color="#00FFAA"
                  />
                  <View style={styles.specInfo}>
                    <Text style={styles.specValue}>{car?.maxSpeed} км/ч</Text>
                    <Text style={styles.specLabel}>Макс. скорость</Text>
                  </View>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="flash-outline" size={18} color="#00FFAA" />
                  <View style={styles.specInfo}>
                    <Text style={styles.specValue}>{car?.batteryLevel}%</Text>
                    <Text style={styles.specLabel}>Заряд</Text>
                  </View>
                </View>
              </View>
              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Ionicons 
                    name="person-outline" 
                    size={18} 
                    color={userLevel >= (car?.minLevel || 1) ? "#00FFAA" : "#FF453A"} 
                  />
                  <View style={styles.specInfo}>
                    <Text style={[
                      styles.specValue,
                      { color: userLevel >= (car?.minLevel || 1) ? "#FFFFFF" : "#FF453A" }
                    ]}>
                      {car?.minLevel}
                    </Text>
                    <Text style={[
                      styles.specLabel,
                      { color: userLevel >= (car?.minLevel || 1) ? "#9F9FAC" : "#FF453A" }
                    ]}>
                      Мин. уровень
                    </Text>
                  </View>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="card-outline" size={18} color="#00FFAA" />
                  <View style={styles.specInfo}>
                    <Text style={styles.specValue}>
                      {car?.pricePerMinute}
                    </Text>
                    <Text style={styles.specLabel}>монет/мин</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Level warning section */}
            {userLevel < (car?.minLevel || 1) && (
              <View style={styles.levelWarningSection}>
                <View style={styles.levelWarningContent}>
                  <Ionicons name="warning" size={20} color="#FF453A" />
                  <Text style={styles.levelWarningText}>
                    Недостаточный уровень для этой машины
                  </Text>
                </View>
                <Text style={styles.levelWarningSubtext}>
                  Требуется уровень {car?.minLevel}. Ваш уровень: {userLevel}
                </Text>
                <Text style={styles.levelWarningAdvice}>
                  Тратьте монеты, чтобы повысить уровень!
                </Text>
              </View>
            )}

            <View style={styles.locationSection}>
              <Text style={styles.locationTitle}>Расположение</Text>
              {locationImages.length > 0 ? (
                <FlatList
                  data={locationImages}
                  renderItem={renderLocationImage}
                  keyExtractor={(item, index) => `location-image-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.locationImagesContainer}
                  pagingEnabled
                />
              ) : (
                <View style={styles.mapPlaceholder}>
                  <ActivityIndicator color="#00FFAA" size="small" />
                  <Text style={styles.mapPlaceholderText}>
                    Загрузка фотографий...
                  </Text>
                </View>
              )}
            </View>

            {car?.status === CarStatus.AVAILABLE && (
              <>
                <TouchableOpacity
                  style={[
                    styles.reserveButton,
                    userLevel < (car?.minLevel || 1) && styles.disabledButton
                  ]}
                  onPress={handleReserveCar}
                  disabled={userLevel < (car?.minLevel || 1)}
                >
                  <Ionicons 
                    name={userLevel < (car?.minLevel || 1) ? "lock-closed-outline" : "calendar-outline"} 
                    size={20} 
                    color={userLevel < (car?.minLevel || 1) ? "#9F9FAC" : "#00FFAA"} 
                  />
                  <Text style={[
                    styles.reserveButtonText,
                    userLevel < (car?.minLevel || 1) && styles.disabledButtonText
                  ]}>
                    {userLevel < (car?.minLevel || 1) ? "Заблокировано" : "Зарезервировать"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    userLevel < (car?.minLevel || 1) && styles.disabledStartButton
                  ]}
                  onPress={handleStartImmediately}
                  disabled={userLevel < (car?.minLevel || 1)}
                >
                  <Ionicons 
                    name={userLevel < (car?.minLevel || 1) ? "lock-closed" : "play"} 
                    size={20} 
                    color={userLevel < (car?.minLevel || 1) ? "#9F9FAC" : "#121220"} 
                  />
                  <Text style={[
                    styles.startButtonText,
                    userLevel < (car?.minLevel || 1) && styles.disabledButtonText
                  ]}>
                    {userLevel < (car?.minLevel || 1) ? "Заблокировано" : "Начать сейчас"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {car?.status !== CarStatus.AVAILABLE && (
              <View style={styles.unavailableMessage}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#FF9500"
                />
                <Text style={styles.unavailableText}>
                  Эта машина сейчас недоступна для аренды
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  carImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#272734',
  },
  contentContainer: {
    padding: 20,
  },
  carHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  carDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#9F9FAC',
    marginBottom: 24,
  },
  specsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  specsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  specInfo: {
    marginLeft: 8,
  },
  specLabel: {
    fontSize: 12,
    color: '#9F9FAC',
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelWarningSection: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  levelWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelWarningText: {
    fontSize: 16,
    color: '#FF453A',
    fontWeight: '600',
    marginLeft: 12,
  },
  levelWarningSubtext: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 4,
  },
  levelWarningAdvice: {
    fontSize: 13,
    color: '#FFD700',
    fontStyle: 'italic',
  },
  locationSection: {
    marginBottom: 24,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  locationImagesContainer: {
    paddingRight: 20,
  },
  locationImage: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#9F9FAC',
    marginTop: 8,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.3)',
  },
  reserveButtonText: {
    color: '#00FFAA',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#121220',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(159, 159, 172, 0.2)',
    borderColor: 'rgba(159, 159, 172, 0.3)',
  },
  disabledStartButton: {
    backgroundColor: 'rgba(159, 159, 172, 0.2)',
  },
  disabledButtonText: {
    color: '#9F9FAC',
  },
  unavailableMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  unavailableText: {
    color: '#FF9500',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
