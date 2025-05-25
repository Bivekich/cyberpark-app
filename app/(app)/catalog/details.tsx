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

export default function CarDetailsScreen() {
  const params = useLocalSearchParams();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationImages, setLocationImages] = useState<string[]>([]);

  useEffect(() => {
    if (carId) {
      fetchCarDetails();
    }
  }, [carId]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      // В реальном приложении здесь должен быть API-запрос
      // Заглушка для демонстрации
      setTimeout(() => {
        const mockCar: Car = {
          id: carId || '1',
          name: 'Cyber Racer X1',
          locationId: 'location1',
          status: CarStatus.AVAILABLE,
          batteryLevel: 85,
          maxSpeed: 25,
          image: 'https://via.placeholder.com/400',
          minLevel: 1,
          description:
            'Быстрый гоночный кибермобиль для новичков. Легкое управление, отличная маневренность и достаточная скорость делают эту модель идеальной для начинающих гонщиков. Специально разработанный дизайн корпуса обеспечивает низкое сопротивление ветру.',
          pricePerMinute: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Мок изображений локации
        const mockLocationImages = [
          'https://via.placeholder.com/300?text=Location+1',
          'https://via.placeholder.com/300?text=Location+2',
          'https://via.placeholder.com/300?text=Location+3',
        ];

        setCar(mockCar);
        setLocationImages(mockLocationImages);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching car details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о машине');
      router.back();
    }
  };

  const getStatusText = (status: CarStatus): string => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'Доступна';
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
      case CarStatus.BUSY:
        return '#FF9500';
      case CarStatus.CHARGING:
        return '#FFCC00';
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
              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <Ionicons
                    name="speedometer-outline"
                    size={20}
                    color="#00FFAA"
                  />
                  <Text style={styles.specLabel}>Макс. скорость</Text>
                  <Text style={styles.specValue}>{car?.maxSpeed} км/ч</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="flash-outline" size={20} color="#00FFAA" />
                  <Text style={styles.specLabel}>Заряд</Text>
                  <Text style={styles.specValue}>{car?.batteryLevel}%</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="person-outline" size={20} color="#00FFAA" />
                  <Text style={styles.specLabel}>Мин. уровень</Text>
                  <Text style={styles.specValue}>{car?.minLevel}</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="card-outline" size={20} color="#00FFAA" />
                  <Text style={styles.specLabel}>Цена</Text>
                  <Text style={styles.specValue}>
                    {car?.pricePerMinute} монет/мин
                  </Text>
                </View>
              </View>
            </View>

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
              <TouchableOpacity
                style={styles.rentButton}
                onPress={handleRentCar}
              >
                <Text style={styles.rentButtonText}>Арендовать машину</Text>
              </TouchableOpacity>
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
    padding: 20,
    marginBottom: 24,
  },
  specsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  specItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  specLabel: {
    fontSize: 14,
    color: '#9F9FAC',
    marginTop: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    paddingRight: 16,
  },
  locationImage: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    color: '#9F9FAC',
    marginTop: 8,
  },
  rentButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  rentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
  unavailableMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  unavailableText: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
