import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reservation } from '@/models/Reservation';
import { reservationService } from '@/services/api/reservations';

interface ReservationTimerProps {
  reservation: Reservation;
  onExpired?: () => void;
}

export function ReservationTimer({ reservation, onExpired }: ReservationTimerProps) {
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
      <Ionicons name="timer" size={16} color={getTimerColor()} />
      <Text style={[styles.timerText, { color: getTimerColor() }]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 