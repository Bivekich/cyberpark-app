import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Location, LocationStatus } from '@/models/Location';

const API_URL = process.env.API_URL || 'http://localhost:3000';

class LocationsService {
  async getLocations(): Promise<Location[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  async getLocationById(locationId: string): Promise<Location | null> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/locations/${locationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  async getOpenLocations(): Promise<Location[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: LocationStatus.OPEN,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching open locations:', error);
      return [];
    }
  }

  async getNearbyLocations(
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<Location[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/locations/nearby`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          latitude,
          longitude,
          radius, // в километрах
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      return [];
    }
  }
}

export const locationsService = new LocationsService();
