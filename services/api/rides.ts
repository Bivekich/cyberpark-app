import { secureStorage } from '@/services/secureStorage';
import { API_URL, ENDPOINTS } from '@/constants/api';
import { Ride } from '@/models/Ride';

export class RidesService {
  async getRides(filter?: string): Promise<Ride[]> {
    try {
      const token = await secureStorage.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const url = filter
        ? `${API_URL}${ENDPOINTS.RIDES}?filter=${filter}`
        : `${API_URL}${ENDPOINTS.RIDES}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }

      const data = await response.json();
      return data as Ride[];
    } catch (error) {
      console.error('Error fetching rides:', error);
      return [];
    }
  }

  async getRideById(id: string): Promise<Ride | null> {
    try {
      const token = await secureStorage.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.RIDES}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ride with id ${id}`);
      }

      const data = await response.json();
      return data as Ride;
    } catch (error) {
      console.error(`Error fetching ride ${id}:`, error);
      return null;
    }
  }

  async bookRide(
    carId: string,
    startTime: Date,
    duration: number
  ): Promise<Ride | null> {
    try {
      const token = await secureStorage.getAuthToken();

      const response = await fetch(`${API_URL}${ENDPOINTS.RIDES}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId,
          startTime,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book ride');
      }

      const data = await response.json();
      return data as Ride;
    } catch (error) {
      console.error('Error booking ride:', error);
      return null;
    }
  }

  async cancelRide(id: string): Promise<boolean> {
    try {
      const token = await secureStorage.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `${API_URL}${ENDPOINTS.RIDES}/${id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel ride with id ${id}`);
      }

      return true;
    } catch (error) {
      console.error(`Error canceling ride ${id}:`, error);
      return false;
    }
  }

  async startRide(rideId: string): Promise<boolean> {
    try {
      const token = await secureStorage.getAuthToken();

      const response = await fetch(
        `${API_URL}${ENDPOINTS.RIDES}/${rideId}/start`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start ride');
      }

      return true;
    } catch (error) {
      console.error('Error starting ride:', error);
      return false;
    }
  }

  async endRide(rideId: string): Promise<boolean> {
    try {
      const token = await secureStorage.getAuthToken();

      const response = await fetch(
        `${API_URL}${ENDPOINTS.RIDES}/${rideId}/end`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to end ride');
      }

      return true;
    } catch (error) {
      console.error('Error ending ride:', error);
      return false;
    }
  }
}

export const ridesService = new RidesService();
