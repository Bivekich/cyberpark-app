import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Car, CarFilter, CarStatus } from '@/models/Car';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface BackendCar {
  id: string;
  name: string;
  topSpeed: number;
  pricePerMinute: number;
  description: string;
  imageUrl?: string;
  status: 'available' | 'in_use' | 'maintenance';
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export class CarsService {
  private transformBackendCar(backendCar: BackendCar): Car {
    // Transform backend car data to frontend Car model
    return {
      id: backendCar.id,
      name: backendCar.name,
      locationId: 'default-location', // Since backend doesn't have locationId
      status: this.mapBackendStatus(backendCar.status),
      batteryLevel: 100, // Default battery level since backend doesn't track this per car type
      maxSpeed: backendCar.topSpeed,
      image: backendCar.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(backendCar.name),
      minLevel: 1, // Default level requirement
      description: backendCar.description,
      pricePerMinute: backendCar.pricePerMinute,
      createdAt: new Date(backendCar.createdAt),
      updatedAt: new Date(backendCar.updatedAt),
    };
  }

  private mapBackendStatus(backendStatus: string): CarStatus {
    switch (backendStatus) {
      case 'available':
        return CarStatus.AVAILABLE;
      case 'reserved':
        return CarStatus.RESERVED;
      case 'in_use':
        return CarStatus.BUSY;
      case 'maintenance':
        return CarStatus.MAINTENANCE;
      default:
        return CarStatus.AVAILABLE;
    }
  }

  async getCars(filter?: CarFilter): Promise<Car[]> {
    try {
      const response = await axios.get(`${API_URL}/cars`);
      const backendCars: BackendCar[] = response.data;
      
      // Transform backend cars to frontend Car models
      let cars = backendCars.map(car => this.transformBackendCar(car));
      
      // Apply frontend filters if provided
      if (filter) {
        if (filter.status) {
          cars = cars.filter(car => car.status === filter.status);
        }
        if (filter.locationId) {
          cars = cars.filter(car => car.locationId === filter.locationId);
        }
      }
      
      return cars;
    } catch (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
  }

  async getCarById(carId: string): Promise<Car | null> {
    try {
      const response = await axios.get(`${API_URL}/cars/${carId}`);
      const backendCar: BackendCar = response.data;
      return this.transformBackendCar(backendCar);
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

  /**
   * Finish a ride - releases the car unit back to available status
   */
  async finishRide(carUnitId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${API_URL}/car-units/finish-ride`,
        {
          carUnitId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // For axios, successful responses (2xx) don't throw errors
      const data = response.data;
      return {
        success: true,
        message: data.message || 'Ride finished successfully'
      };
    } catch (error) {
      console.error('Error finishing ride:', error);
      
      // Handle axios errors specifically
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
        return {
          success: false,
          message: errorMessage
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to finish ride'
      };
    }
  }
}

export const carsService = new CarsService();
