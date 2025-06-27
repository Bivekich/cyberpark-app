import * as SecureStore from 'expo-secure-store';
import { 
  Reservation, 
  ReservationStatus, 
  CreateReservationRequest, 
  ReservationFilter 
} from '@/models/Reservation';

const API_URL = process.env.API_URL || 'http://localhost:3000';

class ReservationService {
  async createReservation(request: CreateReservationRequest): Promise<Reservation | null> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      const data = await response.json();
      return data as Reservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      return null;
    }
  }

  async getActiveReservation(): Promise<Reservation | null> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await fetch(`${API_URL}/reservations/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No active reservation
        }
        throw new Error('Failed to get active reservation');
      }

      const data = await response.json();
      return data as Reservation;
    } catch (error) {
      console.error('Error getting active reservation:', error);
      return null;
    }
  }

  async getReservations(filter?: ReservationFilter): Promise<Reservation[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const queryParams = new URLSearchParams();
      if (filter?.status) queryParams.append('status', filter.status);
      if (filter?.carId) queryParams.append('carId', filter.carId);
      if (filter?.startDate) queryParams.append('startDate', filter.startDate.toISOString());
      if (filter?.endDate) queryParams.append('endDate', filter.endDate.toISOString());

      const response = await fetch(`${API_URL}/reservations?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get reservations');
      }

      const data = await response.json();
      return data as Reservation[];
    } catch (error) {
      console.error('Error getting reservations:', error);
      return [];
    }
  }

  async cancelReservation(reservationId: string): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      return false;
    }
  }

  async useReservation(reservationId: string): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await fetch(`${API_URL}/reservations/${reservationId}/use`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error using reservation:', error);
      return false;
    }
  }

  // Утилитная функция для проверки истечения резервации
  isReservationExpired(reservation: Reservation): boolean {
    return new Date() >= new Date(reservation.expiresAt);
  }

  // Утилитная функция для получения оставшегося времени резервации в секундах
  getReservationTimeLeft(reservation: Reservation): number {
    const now = new Date().getTime();
    const expiresAt = new Date(reservation.expiresAt).getTime();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  }
}

export const reservationService = new ReservationService(); 