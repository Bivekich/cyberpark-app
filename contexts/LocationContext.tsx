import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { Location, LocationStatus } from '@/models/Location';
import { locationsService } from '@/services/api/locations';
import { useAuth } from './AuthContext';

interface LocationContextType {
  userLocation: Location | null;
  availableLocations: Location[];
  isLoadingLocations: boolean;
  showLocationSelector: boolean;
  setShowLocationSelector: (show: boolean) => void;
  setUserLocation: (location: Location) => Promise<void>;
  refreshLocations: () => Promise<void>;
  checkLocationRequired: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const [userLocation, setUserLocationState] = useState<Location | null>(null);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Debug logging for userLocation changes
  useEffect(() => {
    console.log('🗺️ LocationContext - userLocation state changed:', userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('🗺️ LocationContext - User loaded, initializing location ONCE');
      initializeLocation();
    }
  }, [user, hasInitialized]);

  // Fetch available locations when the provider mounts
  useEffect(() => {
    console.log('🗺️ LocationContext - Provider mounted, fetching locations');
    fetchAvailableLocations();
  }, []);

  const initializeLocation = async () => {
    try {
      console.log('🗺️ LocationContext - initializeLocation called ONCE, user:', user);
      setHasInitialized(true);
      
      // SIMPLE LOGIC: Check if user has selectedLocation from database
      if (user?.selectedLocation) {
        console.log('🗺️ LocationContext - Found location in user profile:', user.selectedLocation);
        setUserLocationState(user.selectedLocation);
        return;
      }

      console.log('🗺️ LocationContext - No location found in database, will need to show selector');
      // If no location found, user needs to select one
    } catch (error) {
      console.error('🗺️ LocationContext - Error initializing location:', error);
    }
  };

  const fetchAvailableLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const locations = await locationsService.getOpenLocations();
      console.log('🗺️ LocationContext - Fetched locations from API:', locations);
      
      setAvailableLocations(locations);
    } catch (error) {
      console.error('🗺️ LocationContext - Error fetching locations:', error);
      setAvailableLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const saveLocationToBackend = async (location: Location) => {
    try {
      console.log('🗺️ LocationContext - Saving location to backend database:', location.id);
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        console.error('🗺️ LocationContext - No auth token available');
        return;
      }

      const API_URL = process.env.API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/users/location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ locationId: location.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save location: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🗺️ LocationContext - Location saved to backend successfully:', data);
      
      // Update the user data in auth context with the new location
      if (updateUser) {
        await updateUser();
      }
    } catch (error) {
      console.error('🗺️ LocationContext - Error saving location to backend:', error);
    }
  };

  const setUserLocation = async (location: Location) => {
    try {
      console.log('🗺️ LocationContext - Setting user location:', location);
      setUserLocationState(location);
      
      // Save to backend database
      await saveLocationToBackend(location);
      
      // Modal handles its own closing now
      console.log('🗺️ LocationContext - Location saved successfully');
    } catch (error) {
      console.error('🗺️ LocationContext - Error setting user location:', error);
      throw error;
    }
  };

  const refreshLocations = async () => {
    await fetchAvailableLocations();
  };

  const checkLocationRequired = async (): Promise<boolean> => {
    // SIMPLE: If user has location, don't show selector
    if (userLocation) {
      return false;
    }

    // If no user location and we have available locations, show selector
    if (availableLocations.length > 0) {
      return true;
    }

    // If loading, wait
    if (isLoadingLocations) {
      return false;
    }

    return true; // Default to requiring location selection
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        availableLocations,
        isLoadingLocations,
        showLocationSelector,
        setShowLocationSelector,
        setUserLocation,
        refreshLocations,
        checkLocationRequired,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
} 