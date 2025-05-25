import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Ride, RideStatus } from '@/models/Ride';
import { ridesService } from '@/services/api';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRideDetails();
    }
  }, [id]);

  const fetchRideDetails = async () => {
    try {
      setIsLoading(true);
      const fetchedRide = await ridesService.getRideById(id);
      if (fetchedRide) {
        setRide(fetchedRide);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить информацию о поездке');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching ride details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о поездке');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const getRideStatusText = (status: RideStatus): string => {
    switch (status) {
      case RideStatus.SCHEDULED:
        return 'Запланирован';
      case RideStatus.ACTIVE:
        return 'Активен';
      case RideStatus.COMPLETED:
        return 'Завершен';
      case RideStatus.CANCELED:
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };

  const getRideStatusColor = (status: RideStatus): string => {
    switch (status) {
      case RideStatus.SCHEDULED:
        return '#FFCC00';
      case RideStatus.ACTIVE:
        return '#00FFAA';
      case RideStatus.COMPLETED:
        return '#007AFF';
      case RideStatus.CANCELED:
        return '#FF3B30';
      default:
        return '#9F9FAC';
    }
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (
    startTime: string | Date,
    endTime?: string | Date
  ): string => {
    if (!endTime) return 'В процессе';

    const durationMs =
      new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.floor(durationMs / 60000);

    if (minutes < 60) {
      return `${minutes} мин`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} ч ${remainingMinutes} мин`;
    }
  };

  const handleCancelRide = async () => {
    try {
      setIsCanceling(true);
      const success = await ridesService.cancelRide(id);
      if (success) {
        Alert.alert('Успешно', 'Поездка отменена');
        await fetchRideDetails();
      } else {
        Alert.alert('Ошибка', 'Не удалось отменить поездку');
      }
    } catch (error) {
      console.error('Error canceling ride:', error);
      Alert.alert('Ошибка', 'Не удалось отменить поездку');
    } finally {
      setIsCanceling(false);
    }
  };

  const confirmCancelRide = () => {
    Alert.alert('Отмена поездки', 'Вы уверены, что хотите отменить поездку?', [
      { text: 'Нет', style: 'cancel' },
      { text: 'Да', onPress: handleCancelRide },
    ]);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Детали поездки</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#00FFAA" size="large" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!ride) {
    return (
      <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Детали поездки</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
            <Text style={styles.errorText}>
              Не удалось загрузить информацию о поездке
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Детали поездки</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.rideHeader}>
            <Text style={styles.rideTitle}>
              Заезд #{ride.id.substring(0, 8)}
            </Text>
            <View
              style={[
                styles.rideStatusBadge,
                { backgroundColor: getRideStatusColor(ride.status) + '22' },
              ]}
            >
              <Text
                style={[
                  styles.rideStatusText,
                  { color: getRideStatusColor(ride.status) },
                ]}
              >
                {getRideStatusText(ride.status)}
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Время начала</Text>
                <Text style={styles.detailValue}>
                  {formatDate(ride.startTime)}
                </Text>
              </View>
            </View>

            {ride.endTime && (
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Время окончания</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(ride.endTime)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Продолжительность</Text>
                <Text style={styles.detailValue}>
                  {formatDuration(ride.startTime, ride.endTime)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Стоимость</Text>
                <Text style={styles.detailValue}>{ride.cost} монет</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="car-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ID автомобиля</Text>
                <Text style={styles.detailValue}>{ride.carId}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ID локации</Text>
                <Text style={styles.detailValue}>{ride.locationId}</Text>
              </View>
            </View>
          </View>

          {ride.status === RideStatus.SCHEDULED && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={confirmCancelRide}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.cancelButtonText}>Отменить поездку</Text>
              )}
            </TouchableOpacity>
          )}

          {ride.status === RideStatus.ACTIVE && (
            <BlurView intensity={80} tint="dark" style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color="#3A3A4C" />
                <Text style={styles.mapPlaceholderText}>
                  Карта будет доступна в следующей версии
                </Text>
              </View>
            </BlurView>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272734',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rideStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rideStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#1D1D2B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272734',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#272734',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9F9FAC',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 29, 43, 0.7)',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginTop: 12,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#9F9FAC',
    marginTop: 16,
    textAlign: 'center',
  },
});
