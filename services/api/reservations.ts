import * as SecureStore from 'expo-secure-store';
import { 
  Reservation, 
  ReservationStatus, 
  CreateReservationRequest, 
  ReservationFilter 
} from '@/models/Reservation';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface BackendReservation {
  id: string;
  userId: string;
  carId: string;
  carUnitId?: string;
  startTime: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'used' | 'canceled';
  createdAt: string;
  updatedAt: string;
}

class ReservationService {
  private transformBackendReservation(backendReservation: BackendReservation): Reservation {
    return {
      id: backendReservation.id,
      userId: backendReservation.userId,
      carId: backendReservation.carId,
      carUnitId: backendReservation.carUnitId,
      locationId: 'default-location', // Default since backend doesn't track this yet
      startTime: new Date(backendReservation.startTime),
      expiresAt: new Date(backendReservation.expiresAt),
      status: backendReservation.status as ReservationStatus,
      createdAt: new Date(backendReservation.createdAt),
      updatedAt: new Date(backendReservation.updatedAt),
    };
  }
  async createReservation(request: CreateReservationRequest): Promise<Reservation | null> {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to create reservation';
        throw new Error(errorMessage);
      }

      const backendData: BackendReservation = await response.json();
      return this.transformBackendReservation(backendData);
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error; // Re-throw to allow caller to handle specific errors
    }
  }

  async getActiveReservation(): Promise<Reservation | null> {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/reservations/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No active reservation
        }
        throw new Error('Failed to get active reservation');
      }

      const backendData: BackendReservation = await response.json();
      return this.transformBackendReservation(backendData);
    } catch (error) {
      console.error('Error getting active reservation:', error);
      return null;
    }
  }

  async getReservations(filter?: ReservationFilter): Promise<Reservation[]> {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

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
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/reservations/${reservationId}/use`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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