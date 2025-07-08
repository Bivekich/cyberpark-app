import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Reservation, ReservationStatus } from '@/models/Reservation';
import { reservationService } from '@/services/api/reservations';
import { CarUnit, carUnitsService } from '@/services/api/carUnits';

interface ReservationContextType {
  activeReservation: Reservation | null;
  assignedCarUnit: CarUnit | null;
  isLoading: boolean;
  createReservation: (carId: string) => Promise<boolean>;
  cancelReservation: () => Promise<boolean>;
  useReservation: () => Promise<boolean>;
  refreshActiveReservation: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

interface ReservationProviderProps {
  children: ReactNode;
}

export function ReservationProvider({ children }: ReservationProviderProps) {
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [assignedCarUnit, setAssignedCarUnit] = useState<CarUnit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем активную резервацию при инициализации
  useEffect(() => {
    refreshActiveReservation();
  }, []);

  // Периодически проверяем статус активной резервации
  useEffect(() => {
    if (!activeReservation) return;

    const checkReservationStatus = () => {
      if (reservationService.isReservationExpired(activeReservation)) {
        setActiveReservation(null);
        setAssignedCarUnit(null);
        Alert.alert(
          'Резервация истекла',
          'Время резервации машины истекло. Машина снова доступна для бронирования.'
        );
      }
    };

    const interval = setInterval(checkReservationStatus, 1000);
    return () => clearInterval(interval);
  }, [activeReservation]);

  const refreshActiveReservation = async () => {
    try {
      setIsLoading(true);
      const reservation = await reservationService.getActiveReservation();
      
      // Проверяем, не истекла ли резервация
      if (reservation && !reservationService.isReservationExpired(reservation)) {
        setActiveReservation(reservation);
        
        // Загружаем информацию о назначенной машине
        if (reservation.carUnitId) {
          const carUnit = await carUnitsService.getCarUnitById(reservation.carUnitId);
          setAssignedCarUnit(carUnit);
        } else {
          setAssignedCarUnit(null);
        }
      } else {
        setActiveReservation(null);
        setAssignedCarUnit(null);
      }
    } catch (error) {
      console.error('Error refreshing active reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReservation = async (carId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Проверяем, нет ли уже активной резервации
      if (activeReservation) {
        Alert.alert(
          'Активная резервация',
          'У вас уже есть активная резервация. Отмените её или дождитесь истечения времени.'
        );
        return false;
      }

      const reservation = await reservationService.createReservation({ carId });
      
      if (reservation) {
        setActiveReservation(reservation);
        
        // Загружаем информацию о назначенной машине
        if (reservation.carUnitId) {
          const carUnit = await carUnitsService.getCarUnitById(reservation.carUnitId);
          setAssignedCarUnit(carUnit);
          
          Alert.alert(
            'Резервация создана',
            `Вам назначена машина: ${carUnit?.name || 'Неизвестная машина'}. Резервация действует 10 минут и бесплатна!`
          );
        } else {
          Alert.alert(
            'Резервация создана',
            'Машина зарезервирована на 10 минут бесплатно. Поторопитесь!'
          );
        }
        return true;
      } else {
        Alert.alert(
          'Ошибка резервации',
          'Не удалось зарезервировать машину. Возможно, она уже занята.'
        );
        return false;
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании резервации');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelReservation = async (): Promise<boolean> => {
    if (!activeReservation) return false;

    try {
      setIsLoading(true);
      const success = await reservationService.cancelReservation(activeReservation.id);
      
      if (success) {
        setActiveReservation(null);
        setAssignedCarUnit(null);
        Alert.alert('Резервация отменена', 'Машина снова доступна для бронирования');
        return true;
      } else {
        Alert.alert('Ошибка', 'Не удалось отменить резервацию');
        return false;
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отмене резервации');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const useReservation = async (): Promise<boolean> => {
    if (!activeReservation) return false;

    try {
      setIsLoading(true);
      const success = await reservationService.useReservation(activeReservation.id);
      
      if (success) {
        setActiveReservation(null);
        setAssignedCarUnit(null);
        return true;
      } else {
        Alert.alert('Ошибка', 'Не удалось использовать резервацию');
        return false;
      }
    } catch (error) {
      console.error('Error using reservation:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при использовании резервации');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ReservationContextType = {
    activeReservation,
    assignedCarUnit,
    isLoading,
    createReservation,
    cancelReservation,
    useReservation,
    refreshActiveReservation,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
} 