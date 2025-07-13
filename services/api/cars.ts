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
  minLevel: number;
  locationId?: string | null;
  location?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export class CarsService {
  private transformBackendCar(backendCar: BackendCar): Car {
    // Transform backend car data to frontend Car model
    return {
      id: backendCar.id,
      name: backendCar.name,
      locationId: backendCar.locationId || null, // Use actual locationId from backend
      status: this.mapBackendStatus(backendCar.status),
      batteryLevel: 100, // Default battery level since backend doesn't track this per car type
      maxSpeed: backendCar.topSpeed,
      image: backendCar.imageUrl || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(backendCar.name),
      minLevel: backendCar.minLevel || 1, // Use actual minimum level from backend
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
      console.error('Error fetching car by ID:', error);
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

      const backendCars: BackendCar[] = response.data;
      return backendCars.map(car => this.transformBackendCar(car));
    } catch (error) {
      console.error('Error fetching cars by location:', error);
      return [];
    }
  }

  async reserveCar(carId: string, duration: number = 15): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.post(
        `${API_URL}/reservations`,
        {
          carId,
          durationMinutes: duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.status === 201;
    } catch (error) {
      console.error('Error reserving car:', error);
      return false;
    }
  }
}

export const carsService = new CarsService();
