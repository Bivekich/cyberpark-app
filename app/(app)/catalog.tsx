import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Car, CarStatus } from '@/models/Car';
import { carsService } from '@/services/api/cars';
import { CarCard } from '@/components/ui/CarCard';
import { useLocation } from '@/contexts/LocationContext';

export default function CatalogScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use global location context for location-based filtering
  const { userLocation } = useLocation();

  // Определяем все возможные статусы машин для фильтров
  const statusFilters = [
    { id: 'all', name: 'Все', color: '#FFFFFF', icon: 'list' },
    {
      id: 'available',
      name: 'Доступные',
      color: '#00FFAA',
      icon: 'checkmark-circle',
    },
    { id: 'busy', name: 'Используются', color: '#FF9500', icon: 'hourglass' },
    {
      id: 'charging',
      name: 'Заряжаются',
      color: '#00C8FF',
      icon: 'battery-charging',
    },
    {
      id: 'maintenance',
      name: 'На обслуживании',
      color: '#FF453A',
      icon: 'construct',
    },
    { id: 'offline', name: 'Недоступны', color: '#8E8E93', icon: 'power' },
  ];

  useEffect(() => {
    if (userLocation) {
      fetchCarsByLocation();
    } else {
      fetchCars();
    }
  }, [userLocation]);

  useEffect(() => {
    filterCars();
  }, [cars, selectedFilter, searchQuery]);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const fetchedCars = await carsService.getCars();
      setCars(fetchedCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarsByLocation = async () => {
    if (!userLocation) return;
    
    try {
      setIsLoading(true);
      console.log('🚗 Fetching cars for location:', userLocation.name, userLocation.id);
      const fetchedCars = await carsService.getCarsByLocation(userLocation.id);
      console.log('🚗 Fetched cars:', fetchedCars.length);
      setCars(fetchedCars);
    } catch (error) {
      console.error('Error fetching cars by location:', error);
      // Fallback to all cars if location-specific fetch fails
      const allCars = await carsService.getCars();
      const locationCars = allCars.filter(car => car.locationId === userLocation.id);
      setCars(locationCars);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = [...cars];

    // Фильтрация по статусу
    if (selectedFilter !== 'all') {
      const statusMap: Record<string, CarStatus> = {
        available: CarStatus.AVAILABLE,
        busy: CarStatus.BUSY,
        charging: CarStatus.CHARGING,
        maintenance: CarStatus.MAINTENANCE,
        offline: CarStatus.OFFLINE,
      };

      filtered = filtered.filter(
        (car) => car.status === statusMap[selectedFilter]
      );
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.name.toLowerCase().includes(query) ||
          (car.description?.toLowerCase().includes(query) ?? false)
      );
    }

    setFilteredCars(filtered);
  };

  const getStatusColor = (status: CarStatus) => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return '#00FFAA';
      case CarStatus.RESERVED:
        return '#FFCC00';
      case CarStatus.BUSY:
        return '#FF9500';
      case CarStatus.CHARGING:
        return '#00C8FF';
      case CarStatus.MAINTENANCE:
        return '#FF453A';
      case CarStatus.OFFLINE:
        return '#8E8E93';
      default:
        return '#FFFFFF';
    }
  };

  const getStatusText = (status: CarStatus) => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'Доступна';
      case CarStatus.RESERVED:
        return 'Зарезервирована';
      case CarStatus.BUSY:
        return 'Используется';
      case CarStatus.CHARGING:
        return 'Заряжается';
      case CarStatus.MAINTENANCE:
        return 'Обслуживание';
      case CarStatus.OFFLINE:
        return 'Недоступна';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: CarStatus) => {
    switch (status) {
      case CarStatus.AVAILABLE:
        return 'checkmark-circle';
      case CarStatus.RESERVED:
        return 'timer';
      case CarStatus.BUSY:
        return 'hourglass';
      case CarStatus.CHARGING:
        return 'battery-charging';
      case CarStatus.MAINTENANCE:
        return 'construct';
      case CarStatus.OFFLINE:
        return 'power';
      default:
        return 'help-circle';
    }
  };

  const renderCarItem = ({ item }: { item: Car }) => (
    <CarCard car={item} onRefresh={userLocation ? fetchCarsByLocation : fetchCars} />
  );

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Каталог машин</Text>
          {userLocation && (
            <Text style={styles.locationInfo}>
              📍 {userLocation.name}
            </Text>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9F9FAC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск машин..."
            placeholderTextColor="#9F9FAC"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersGridContainer}
          contentContainerStyle={styles.filtersContentContainer}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterGridItem,
                selectedFilter === filter.id && {
                  backgroundColor: filter.color + '20',
                  borderColor: filter.color,
                },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={18}
                color={selectedFilter === filter.id ? filter.color : '#9F9FAC'}
              />
              <Text
                style={[
                  styles.filterGridText,
                  selectedFilter === filter.id && { color: filter.color },
                ]}
                numberOfLines={1}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#00FFAA" size="large" />
            <Text style={styles.loadingText}>
              {userLocation ? `Загружаем машины в ${userLocation.name}...` : 'Загружаем машины...'}
            </Text>
          </View>
        ) : (
          <>
            {filteredCars.length > 0 ? (
              <FlatList
                data={filteredCars}
                renderItem={renderCarItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.carsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={64} color="#9F9FAC" />
                <Text style={styles.emptyText}>
                  {!userLocation 
                    ? "Выберите локацию на главном экране, чтобы увидеть доступные машины"
                    : filteredCars.length === 0 && cars.length === 0
                    ? `В локации "${userLocation.name}" пока нет машин`
                    : "Машин по заданным критериям не найдено"}
                </Text>
                {userLocation && filteredCars.length === 0 && cars.length > 0 && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                      setSelectedFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationInfo: {
    fontSize: 14,
    color: '#00FFAA',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filtersGridContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    paddingBottom: 20,
  },
  filtersContentContainer: {
    paddingRight: 20, // Add padding to the right to prevent filters from being cut off
  },
  filterGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterGridText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9F9FAC',
    marginTop: 12,
  },
  carsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#00FFAA',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#121220',
    fontWeight: 'bold',
  },
});
