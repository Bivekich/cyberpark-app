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
import { usersApi } from '@/services/api/users';
import { useState, useEffect } from 'react';

interface CarCardProps {
  car: Car;
  onRefresh?: () => void;
}

export function CarCard({ car, onRefresh }: CarCardProps) {
  const { activeReservation, assignedCarUnit, isLoading, createReservation, cancelReservation } = useReservation();
  const [userLevel, setUserLevel] = useState<number>(1);
  const [isLevelLoading, setIsLevelLoading] = useState(true);

  // Fetch user level when component mounts
  useEffect(() => {
    fetchUserLevel();
  }, []);

  const fetchUserLevel = async () => {
    try {
      const levelData = await usersApi.getUserLevel();
      setUserLevel(levelData.level);
    } catch (error) {
      console.error('Error fetching user level:', error);
    } finally {
      setIsLevelLoading(false);
    }
  };

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
  
  // Check if user level is sufficient for this car
  const hasMinimumLevel = userLevel >= car.minLevel;
  const isLevelTooLow = !hasMinimumLevel;

  const handleReserve = async () => {
    try {
      // Check user level first
      if (isLevelTooLow) {
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
      // Check user level first
      if (isLevelTooLow) {
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
      {/* Header with name and status */}
      <View style={styles.carHeader}>
        <Text style={styles.carName} numberOfLines={1}>{car.name}</Text>
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

      {/* Car Image */}
      <TouchableOpacity onPress={handleViewDetails}>
        <View style={styles.carImageContainer}>
          <Image
            source={{ uri: car.image }}
            style={styles.carImage}
            resizeMode="contain"
          />
          {/* Level indicator overlay */}
          {isLevelTooLow && (
            <View style={styles.levelOverlay}>
              <Ionicons name="lock-closed" size={24} color="#FF453A" />
              <Text style={styles.levelOverlayText}>Уровень {car.minLevel}+</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Car specifications in organized grid */}
      <View style={styles.specsGrid}>
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="flash" size={14} color="#00FFAA" />
            <Text style={styles.specText}>{car.batteryLevel}%</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="speedometer" size={14} color="#00FFAA" />
            <Text style={styles.specText}>{car.maxSpeed} км/ч</Text>
          </View>
        </View>
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="pricetags" size={14} color="#FFD700" />
            <Text style={styles.specText}>{car.pricePerMinute} монет/мин</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons 
              name="trophy" 
              size={14} 
              color={isLevelTooLow ? "#FF453A" : "#FFD700"} 
            />
            <Text style={[styles.specText, { color: isLevelTooLow ? "#FF453A" : "#FFD700" }]}>
              Уровень {car.minLevel}+
            </Text>
          </View>
        </View>
      </View>

     
      {/* Reservation section */}
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
              <Ionicons name="car" size={14} color="#121220" />
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
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                  <Text style={styles.cancelButtonText}>Отменить</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action buttons for available cars */}
      {canReserve && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.reserveButton,
              isLevelTooLow && styles.disabledButton
            ]}
            onPress={handleReserve}
            disabled={isLoading || isLevelTooLow}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isLevelTooLow ? "#9F9FAC" : "#FFFFFF"} />
            ) : (
              <>
                <Ionicons 
                  name={isLevelTooLow ? "lock-closed" : "time"} 
                  size={16} 
                  color={isLevelTooLow ? "#9F9FAC" : "#FFFFFF"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  styles.reserveButtonText,
                  isLevelTooLow && styles.disabledButtonText
                ]}>
                  {isLevelTooLow ? "Заблокировано" : "Зарезервировать"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.startNowButton,
              isLevelTooLow && styles.disabledButton
            ]}
            onPress={handleStartNow}
            disabled={isLoading || isLevelTooLow}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isLevelTooLow ? "#9F9FAC" : "#121220"} />
            ) : (
              <>
                <Ionicons 
                  name={isLevelTooLow ? "lock-closed" : "play"} 
                  size={16} 
                  color={isLevelTooLow ? "#9F9FAC" : "#121220"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  styles.startNowButtonText,
                  isLevelTooLow && styles.disabledButtonText
                ]}>
                  {isLevelTooLow ? "Заблокировано" : "Начать"}
                </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 24,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  carImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  levelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelOverlayText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  specsGrid: {
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  specText: {
    fontSize: 13,
    color: '#9F9FAC',
    marginLeft: 6,
    fontWeight: '500',
  },
  levelWarningSection: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  levelWarningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelWarningText: {
    fontSize: 12,
    color: '#FF453A',
    fontWeight: '600',
    marginLeft: 6,
  },
  reservationSection: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
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
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  reserveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  reserveButtonText: {
    color: '#FFFFFF',
  },
  startNowButton: {
    backgroundColor: '#00FFAA',
  },
  startNowButtonText: {
    color: '#121220',
  },
  disabledButton: {
    backgroundColor: 'rgba(159, 159, 172, 0.2)',
    borderColor: 'rgba(159, 159, 172, 0.3)',
  },
  disabledButtonText: {
    color: '#9F9FAC',
  },
}); 