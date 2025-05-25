import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Car, CarFilter, CarStatus } from '@/models/Car';

const API_URL = process.env.API_URL || 'http://localhost:3000';

class CarsService {
  async getCars(filter?: CarFilter): Promise<Car[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/cars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filter,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
  }

  async getCarById(carId: string): Promise<Car | null> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  }

  async getCarsByLocation(locationId: string): Promise<Car[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(
        `${API_URL}/locations/${locationId}/cars`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching cars by location:', error);
      return [];
    }
  }

  async checkCarAvailability(carId: string, startTime: Date): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(
        `${API_URL}/cars/${carId}/availability`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startTime: startTime.toISOString(),
          },
        }
      );

      return response.data.available;
    } catch (error) {
      console.error('Error checking car availability:', error);
      return false;
    }
  }

  async controlCar(
    carId: string,
    command: string,
    params?: any
  ): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      await axios.post(
        `${API_URL}/cars/${carId}/control`,
        {
          command,
          params,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Error controlling car:', error);
      return false;
    }
  }
}

export const carsService = new CarsService();
