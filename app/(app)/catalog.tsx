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
import { CarCard } from '@/components/ui/CarCard';

export default function CatalogScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, selectedFilter, searchQuery]);

  const fetchCars = async () => {
    try {
      setIsLoading(true);

      // Здесь должен быть реальный вызов API
      // Заглушка для демонстрации
      const mockCars: Car[] = [
        {
          id: '1',
          name: 'Cyber Racer X1',
          locationId: 'location1',
          status: CarStatus.AVAILABLE,
          batteryLevel: 85,
          maxSpeed: 25,
          image: 'https://via.placeholder.com/150',
          minLevel: 1,
          description: 'Быстрый гоночный кибермобиль для новичков',
          pricePerMinute: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Drift King V8',
          locationId: 'location1',
          status: CarStatus.AVAILABLE,
          batteryLevel: 92,
          maxSpeed: 30,
          image: 'https://via.placeholder.com/150',
          minLevel: 2,
          description: 'Специализирован на дрифте и крутых поворотах',
          pricePerMinute: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Monster Truck Mini',
          locationId: 'location2',
          status: CarStatus.BUSY,
          batteryLevel: 78,
          maxSpeed: 20,
          image: 'https://via.placeholder.com/150',
          minLevel: 1,
          description: 'Проходимость по любым поверхностям',
          pricePerMinute: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          name: 'Stealth Ninja EV',
          locationId: 'location2',
          status: CarStatus.CHARGING,
          batteryLevel: 35,
          maxSpeed: 28,
          image: 'https://via.placeholder.com/150',
          minLevel: 3,
          description: 'Тихий и быстрый, идеален для дрифта',
          pricePerMinute: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '5',
          name: 'Roadster Turbo',
          locationId: 'location3',
          status: CarStatus.MAINTENANCE,
          batteryLevel: 0,
          maxSpeed: 35,
          image: 'https://via.placeholder.com/150',
          minLevel: 4,
          description: 'Максимальная скорость для опытных гонщиков',
          pricePerMinute: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '6',
          name: 'Dune Buggy Mini',
          locationId: 'location3',
          status: CarStatus.OFFLINE,
          batteryLevel: 40,
          maxSpeed: 22,
          image: 'https://via.placeholder.com/150',
          minLevel: 2,
          description: 'Проходимость по песчаным трассам',
          pricePerMinute: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setCars(mockCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
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
    <CarCard car={item} onRefresh={fetchCars} />
  );

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Каталог машин</Text>
        </View>

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

        {/* Заголовок для фильтров */}
        <View style={styles.filterHeaderContainer}>
          <Text style={styles.filterHeaderText}>Статус машин</Text>
          {selectedFilter !== 'all' && (
            <TouchableOpacity
              style={styles.resetFiltersButton}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={styles.resetFiltersText}>Сбросить</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Обновленные фильтры в виде сетки */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersGridContainer}
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
                  Машин по заданным критериям не найдено
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSelectedFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
                </TouchableOpacity>
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
  // Новые стили для заголовка фильтров
  filterHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetFiltersButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  resetFiltersText: {
    fontSize: 14,
    color: '#00FFAA',
  },
  // Новые стили для горизонтального списка фильтров
  filtersGridContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  filterGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 100,
  },
  filterGridText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 6,
  },
  // Сохраняем оригинальные стили для совместимости
  filtersContainer: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carsList: {
    padding: 16,
  },
  carCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  carImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 12,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  specText: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 4,
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
