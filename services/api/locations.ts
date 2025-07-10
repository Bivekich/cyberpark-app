import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Location, LocationStatus } from '@/models/Location';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// API Response interface (what we actually get from backend)
interface ApiLocationResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transform API response to our Location model
function transformApiLocationToLocation(apiLocation: ApiLocationResponse): Location {
  return {
    id: apiLocation.id,
    name: apiLocation.name,
    address: apiLocation.description || 'Адрес не указан', // Use description as address fallback
    coordinates: { latitude: 55.7558, longitude: 37.6173 }, // Default Moscow coordinates
    status: apiLocation.isActive ? LocationStatus.OPEN : LocationStatus.CLOSED,
    description: apiLocation.description,
    image: apiLocation.imageUrl,
    createdAt: new Date(apiLocation.createdAt),
    updatedAt: new Date(apiLocation.updatedAt),
  };
}

class LocationsService {
  async getLocations(): Promise<Location[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apiLocations: ApiLocationResponse[] = response.data;
      return apiLocations.map(transformApiLocationToLocation);
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

      const apiLocation: ApiLocationResponse = response.data;
      return transformApiLocationToLocation(apiLocation);
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

      const apiLocations: ApiLocationResponse[] = response.data;
      // Filter for active locations since backend might not support status filtering
      return apiLocations
        .filter(loc => loc.isActive)
        .map(transformApiLocationToLocation);
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

      const apiLocations: ApiLocationResponse[] = response.data;
      return apiLocations.map(transformApiLocationToLocation);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      return [];
    }
  }
}

export const locationsService = new LocationsService();
