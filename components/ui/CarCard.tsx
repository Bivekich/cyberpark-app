import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Car, CarStatus } from '@/models/Car';
import { useReservation } from '@/contexts/ReservationContext';
import { ReservationTimer } from './ReservationTimer';
import { balanceService } from '@/services/api/balance';

interface CarCardProps {
  car: Car;
  onRefresh?: () => void;
}

export function CarCard({ car, onRefresh }: CarCardProps) {
  const { activeReservation, assignedCarUnit, isLoading, createReservation, cancelReservation } = useReservation();

  const getStatusText = (status: CarStatus) => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'Доступна';
      case CarStatus.RESERVED:
        return 'Зарезервирована';
      case CarStatus.BUSY:
        return 'Используется';
      case CarStatus.CHARGING:
        return 'Заряжается';
      case CarStatus.MAINTENANCE:
        return 'Обслуживание';
      case CarStatus.OFFLINE:
        return 'Недоступна';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: CarStatus) => {
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
        return '#FF453A';
      case CarStatus.OFFLINE:
        return '#8E8E93';
      default:
        return '#FFFFFF';
    }
  };

  const getStatusIcon = (status: CarStatus) => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'checkmark-circle';
      case CarStatus.RESERVED:
        return 'timer';
      case CarStatus.BUSY:
        return 'hourglass';
      case CarStatus.CHARGING:
        return 'battery-charging';
      case CarStatus.MAINTENANCE:
        return 'construct';
      case CarStatus.OFFLINE:
        return 'power';
      default:
        return 'help-circle';
    }
  };

  const isReservedByMe = activeReservation?.carId === car.id;
  const canReserve = car.status === CarStatus.AVAILABLE && !activeReservation;
  const canCancelReservation = isReservedByMe;

  const handleReserve = async () => {
    try {
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
      if (success && onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error reserving car:', error);
      Alert.alert('Ошибка', 'Не удалось зарезервировать машину');
    }
  };

  const handleStartNow = async () => {
    try {
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
      
      // Navigate directly to control screen with correct parameter name
      router.push({
        pathname: '/(app)/control',
        params: { id: car.id }
      });
    } catch (error) {
      console.error('Error starting car immediately:', error);
      Alert.alert('Ошибка', 'Не удалось начать поездку');
    }
  };

  const handleCancelReservation = async () => {
    const success = await cancelReservation();
    if (success && onRefresh) {
      onRefresh();
    }
  };

  const handleUseReservation = () => {
    router.push({
      pathname: '/catalog/details',
      params: { id: car.id, useReservation: 'true' },
    });
  };

  const handleViewDetails = () => {
    router.push({
      pathname: '/catalog/details',
      params: { id: car.id },
    });
  };

  return (
    <View style={styles.carCard}>
      <View style={styles.carHeader}>
        <Text style={styles.carName}>{car.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(car.status) + '20' }]}>
          <Ionicons
            name={getStatusIcon(car.status)}
            size={12}
            color={getStatusColor(car.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(car.status) }]}>
            {getStatusText(car.status)}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleViewDetails}>
        <View style={styles.carImageContainer}>
          <Image
            source={{ uri: car.image }}
            style={styles.carImage}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      <View style={styles.carSpecs}>
        <View style={styles.specItem}>
          <Ionicons name="flash" size={16} color="#00FFAA" />
          <Text style={styles.specText}>{car.batteryLevel}%</Text>
        </View>
        <View style={styles.specItem}>
          <Ionicons name="speedometer" size={16} color="#00FFAA" />
          <Text style={styles.specText}>{car.maxSpeed} км/ч</Text>
        </View>
        <View style={styles.specItem}>
          <Ionicons name="pricetags" size={16} color="#00FFAA" />
          <Text style={styles.specText}>{car.pricePerMinute} монет/мин</Text>
        </View>
      </View>

      {/* Секция резервации */}
      {isReservedByMe && activeReservation && (
        <View style={styles.reservationSection}>
          <ReservationTimer
            reservation={activeReservation}
            assignedCarUnit={assignedCarUnit}
            onExpired={() => onRefresh?.()}
          />
          <View style={styles.reservationButtons}>
            <TouchableOpacity
              style={styles.useButton}
              onPress={handleUseReservation}
            >
              <Ionicons name="car" size={16} color="#FFFFFF" />
              <Text style={styles.useButtonText}>Использовать</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelReservation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                  <Text style={styles.cancelButtonText}>Отменить</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Двойные кнопки для доступных машин */}
      {canReserve && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={handleReserve}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#121220" />
            ) : (
              <>
                <Ionicons name="time" size={16} color="#121220" />
                <Text style={styles.reserveButtonText}>Зарезервировать</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.startNowButton}
            onPress={handleStartNow}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startNowButtonText}>Начать сейчас</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  carImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  specText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 4,
  },
  reservationSection: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  reservationButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFAA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  useButtonText: {
    color: '#121220',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reserveButtonText: {
    color: '#121220',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  startNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  startNowButtonText: {
    color: '#121220',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 