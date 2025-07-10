import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useReservation } from '@/contexts/ReservationContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Car, CarStatus } from '@/models/Car';
import { balanceService } from '@/services/api/balance';
import { carsService } from '@/services/api/cars';
import { ReservationTimer } from '@/components/ui/ReservationTimer';
import { LocationSelectionModal } from '@/components/ui/LocationSelectionModal';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { userLocation, showLocationSelector, setShowLocationSelector } = useLocation();
  const { activeReservation, assignedCarUnit, refreshActiveReservation } = useReservation();
  const [recentCars, setRecentCars] = useState<Car[]>([]);
  const [nearbyAvailable, setNearbyAvailable] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Debug logging for location
  useEffect(() => {
    console.log('🗺️ HomeScreen - userLocation changed:', userLocation);
  }, [userLocation]);

  useEffect(() => {
    console.log('🗺️ HomeScreen - user changed:', user);
  }, [user]);

  useEffect(() => {
    fetchCarsData();
    fetchBalance();
  }, []);

  // Обновляем баланс каждый раз, когда экран получает фокус
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [])
  );

  const fetchBalance = async () => {
    try {
      const userBalance = await balanceService.getUserBalance();
      setBalance(userBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchCarsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real cars data from backend
      const cars = await carsService.getCars();
      
      // Set recent cars (latest 2)
      setRecentCars(cars.slice(0, 2));

      // Get available cars for quick start
      const availableCars = cars.filter(
        (car) => car.status === CarStatus.AVAILABLE
      );
      setNearbyAvailable(availableCars);

      // Select first available car for quick start
      if (availableCars.length > 0) {
        setSelectedCar(availableCars[0]);
      }
    } catch (error) {
      console.error('Error fetching cars data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора машины для быстрого старта
  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    setShowCarSelector(false);
  };

  // Обработчик смены локации
  const handleLocationChange = () => {
    setShowLocationSelector(true);
  };

  // Рендер элемента машины в селекторе
  const renderCarSelectorItem = ({ item }: { item: Car }) => (
    <TouchableOpacity
      style={[
        styles.carSelectorItem,
        selectedCar?.id === item.id && styles.carSelectorItemSelected,
      ]}
      onPress={() => handleSelectCar(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.carSelectorImage}
        resizeMode="cover"
      />
      <View style={styles.carSelectorInfo}>
        <Text style={styles.carSelectorName}>{item.name}</Text>
        <View style={styles.carSelectorSpecs}>
          <View style={styles.specItem}>
            <Ionicons name="flash" size={14} color="#00FFAA" />
            <Text style={styles.carSelectorSpecText}>{item.batteryLevel}%</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="speedometer" size={14} color="#00FFAA" />
            <Text style={styles.carSelectorSpecText}>{item.maxSpeed} км/ч</Text>
          </View>
        </View>
        <Text style={styles.carSelectorPrice}>
          {item.pricePerMinute} монет/мин
        </Text>
      </View>
      {selectedCar?.id === item.id && (
        <View style={styles.carSelectorCheckmark}>
          <Ionicons name="checkmark-circle" size={24} color="#00FFAA" />
        </View>
      )}
    </TouchableOpacity>
  );

  const quickStart = () => {
    // В реальном приложении здесь был бы запрос к API для начала аренды ближайшей машины
    // Но для демонстрации просто показываем диалог и переходим на экран управления

    // Находим доступную машину для быстрого старта
    const availableCar = nearbyAvailable.find(
      (car) => car.status === CarStatus.AVAILABLE
    );

    if (availableCar) {
      Alert.alert(
        'Быстрый старт',
        `Начинаем аренду машины ${availableCar.name}. Стоимость: ${availableCar.pricePerMinute} ₽/мин.`,
        [
          {
            text: 'Отмена',
            style: 'cancel',
          },
          {
            text: 'Начать поездку',
            onPress: () => {
              // Имитируем начало поездки
              router.push('/control');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Нет доступных машин',
        'К сожалению, в данный момент нет доступных машин для аренды.'
      );
    }
  };

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Привет,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Гонщик'}</Text>
              
              {/* Location display - always show with fallback text */}
              <TouchableOpacity 
                style={styles.locationContainer}
                onPress={handleLocationChange}
              >
                <Ionicons 
                  name="location" 
                  size={16} 
                  color={userLocation ? "#00FFAA" : "#FF9500"} 
                />
                <Text style={styles.locationText}>
                  {userLocation ? userLocation.name : 'Выберите локацию'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#9F9FAC" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/profile/notifications')}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceCard}>
            <View>
              <Text style={styles.balanceLabel}>Ваш баланс</Text>
              <Text style={styles.balanceValue}>{balance.toFixed(0)} ₽</Text>
            </View>
            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => router.push('/profile/deposit')}
            >
              <Text style={styles.topUpButtonText}>Пополнить</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color="#00FFAA" size="large" />
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Недавние машины</Text>
                <TouchableOpacity onPress={() => router.push('/catalog')}>
                  <Text style={styles.seeAllText}>Все машины</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.carsScrollView}
              >
                {recentCars.map((car) => (
                  <TouchableOpacity
                    key={car.id}
                    style={styles.carCard}
                    onPress={() =>
                      router.push({
                        pathname: '/catalog/details',
                        params: { id: car.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: car.image }}
                      style={styles.carImage}
                      resizeMode="cover"
                    />
                    <View style={styles.carInfo}>
                      <Text style={styles.carName}>{car.name}</Text>
                      <View style={styles.carSpecs}>
                        <View style={styles.specItem}>
                          <Ionicons
                            name="flash-outline"
                            size={16}
                            color="#00FFAA"
                          />
                          <Text style={styles.specText}>
                            {car.batteryLevel}%
                          </Text>
                        </View>
                        <View style={styles.specItem}>
                          <Ionicons
                            name="speedometer-outline"
                            size={16}
                            color="#00FFAA"
                          />
                          <Text style={styles.specText}>
                            {car.maxSpeed} км/ч
                          </Text>
                        </View>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>
                          {car.pricePerMinute} монет/мин
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Секция активной резервации */}
              {activeReservation && (
                <View style={styles.reservationSection}>
                  <View style={styles.reservationHeader}>
                    <Text style={styles.reservationTitle}>Активная резервация</Text>
                    <ReservationTimer
                      reservation={activeReservation}
                      assignedCarUnit={assignedCarUnit}
                      onExpired={refreshActiveReservation}
                    />
                  </View>
                  <View style={styles.reservationCard}>
                    <Text style={styles.reservationCarName}>
                      Зарезервированная машина
                    </Text>
                    <TouchableOpacity
                      style={styles.useReservationButton}
                      onPress={() =>
                        router.push({
                          pathname: '/catalog/details',
                          params: { id: activeReservation.carId, useReservation: 'true' },
                        })
                      }
                    >
                      <Ionicons name="car" size={20} color="#FFFFFF" />
                      <Text style={styles.useReservationText}>Использовать резервацию</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.quickStartSection}>
                <View style={styles.quickStartHeader}>
                  <Text style={styles.quickStartTitle}>Быстрый старт</Text>
                  {nearbyAvailable.length > 1 && (
                    <TouchableOpacity onPress={quickStart}>
                      <Text style={styles.changeCar}>Выбрать машину</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {selectedCar ? (
                  <View style={styles.quickStartCardContainer}>
                    <View style={styles.quickStartCard}>
                      <Image
                        source={{ uri: selectedCar.image }}
                        style={styles.quickStartCarImage}
                        resizeMode="cover"
                      />
                      <View style={styles.quickStartCarInfo}>
                        <Text style={styles.quickStartCarName}>
                          {selectedCar.name}
                        </Text>
                        <View style={styles.quickStartCarSpecs}>
                          <Text style={styles.quickStartCarSpec}>
                            <Ionicons name="flash" size={14} color="#00FFAA" />{' '}
                            {selectedCar.batteryLevel}%
                          </Text>
                          <Text style={styles.quickStartCarSpec}>
                            <Ionicons
                              name="speedometer"
                              size={14}
                              color="#00FFAA"
                            />{' '}
                            {selectedCar.maxSpeed} км/ч
                          </Text>
                          <Text style={styles.quickStartCarPrice}>
                            {selectedCar.pricePerMinute} монет/мин
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.quickStartButton}
                      onPress={() =>
                        router.push({
                          pathname: '/control',
                          params: { id: selectedCar.id, action: 'rent' },
                        })
                      }
                    >
                      <Ionicons name="flash" size={24} color="#FFFFFF" />
                      <Text style={styles.quickStartText}>Начать заезд</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.quickStartButton}
                    onPress={() => router.push('/catalog')}
                  >
                    <Ionicons name="search" size={24} color="#FFFFFF" />
                    <Text style={styles.quickStartText}>
                      Найти доступную машину
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.activitySection}>
                <Text style={styles.sectionTitle}>Последняя активность</Text>
                <View style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name="car-sport" size={24} color="#00FFAA" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Заезд завершен</Text>
                    <Text style={styles.activityDescription}>
                      Drift King V8 • 15 мин
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>28 мин назад</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/profile/rides')}
                >
                  <Text style={styles.viewAllText}>Посмотреть все заезды</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Модальное окно для выбора машины */}
      <Modal
        visible={showCarSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCarSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите машину</Text>
              <TouchableOpacity onPress={() => setShowCarSelector(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={nearbyAvailable}
              renderItem={renderCarSelectorItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.carSelectorList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCarSelector(false)}
            >
              <Text style={styles.modalCloseButtonText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно для выбора локации */}
      <LocationSelectionModal
        visible={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
      />
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9F9FAC',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  balanceCard: {
    backgroundColor: 'rgba(0, 255, 170, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00FFAA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9F9FAC',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topUpButton: {
    backgroundColor: '#00FFAA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  topUpButtonText: {
    color: '#121220',
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00FFAA',
  },
  carsScrollView: {
    marginBottom: 24,
  },
  carCard: {
    width: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  carImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#272734',
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  carSpecs: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  specText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FFAA',
  },
  quickStartSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  quickStartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeCar: {
    fontSize: 14,
    color: '#00FFAA',
  },
  quickStartCardContainer: {
    marginBottom: 16,
  },
  quickStartCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  quickStartCarImage: {
    width: 80,
    height: 80,
    backgroundColor: '#272734',
  },
  quickStartCarInfo: {
    flex: 1,
    padding: 12,
  },
  quickStartCarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quickStartCarSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickStartCarSpec: {
    fontSize: 12,
    color: '#9F9FAC',
    marginRight: 12,
    marginBottom: 4,
  },
  quickStartCarPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FFAA',
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 14,
  },
  quickStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
    marginLeft: 8,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activityDescription: {
    fontSize: 12,
    color: '#9F9FAC',
  },
  activityTime: {
    fontSize: 12,
    color: '#9F9FAC',
  },
  viewAllButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#00FFAA',
  },
  // Стили для модального окна выбора машины
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  carSelectorList: {
    paddingBottom: 20,
  },
  carSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  carSelectorItemSelected: {
    borderWidth: 1,
    borderColor: '#00FFAA',
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
  },
  carSelectorImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#272734',
  },
  carSelectorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  carSelectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  carSelectorSpecs: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  carSelectorSpecText: {
    fontSize: 12,
    color: '#9F9FAC',
    marginLeft: 4,
  },
  carSelectorPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FFAA',
  },
  carSelectorCheckmark: {
    marginLeft: 8,
  },
  modalCloseButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
  reservationSection: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFCC00',
  },
  reservationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
  },
  reservationCarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  useReservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFAA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  useReservationText: {
    color: '#121220',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
