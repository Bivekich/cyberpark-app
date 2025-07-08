import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '@/models/Reservation';
import { CarUnit } from '@/services/api/carUnits';
import { reservationService } from '@/services/api/reservations';

interface ReservationTimerProps {
  reservation: Reservation;
  assignedCarUnit?: CarUnit | null;
  onExpired?: () => void;
}

export function ReservationTimer({ reservation, assignedCarUnit, onExpired }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(
    reservationService.getReservationTimeLeft(reservation)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = reservationService.getReservationTimeLeft(reservation);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpired?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation, onExpired]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (timeLeft <= 60) return '#FF3B30'; // Красный для последней минуты
    if (timeLeft <= 180) return '#FF9500'; // Оранжевый для последних 3 минут
    return '#00FFAA'; // Зеленый для остального времени
  };

  if (timeLeft <= 0) {
    return (
      <View style={styles.timerContainer}>
        <Ionicons name="time" size={16} color="#FF3B30" />
        <Text style={[styles.timerText, { color: '#FF3B30' }]}>
          Резервация истекла
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerRow}>
        <Ionicons name="timer" size={16} color={getTimerColor()} />
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {formatTime(timeLeft)}
        </Text>
      </View>
      {assignedCarUnit && (
        <View style={styles.carUnitRow}>
          <Ionicons name="car-sport" size={14} color="#00FFAA" />
          <Text style={styles.carUnitText}>
            {assignedCarUnit.name}
          </Text>
          <View style={styles.batteryContainer}>
            <Ionicons name="battery-full" size={12} color="#00FFAA" />
            <Text style={styles.batteryText}>{assignedCarUnit.battery}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  carUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  carUnitText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    flex: 1,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 11,
    color: '#00FFAA',
    marginLeft: 2,
  },
}); 