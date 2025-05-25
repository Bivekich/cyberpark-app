import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Типы поездок
enum RideStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Интерфейс поездки
interface Ride {
  id: string;
  carId: string;
  carName: string;
  startLocation: string;
  endLocation: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  distance: number | null;
  cost: number; // теперь в монетках
  status: RideStatus;
}

// Тестовые данные для демонстрации
const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    carId: '2',
    carName: 'Drift King V8',
    startLocation: 'Зона активации',
    endLocation: 'Зона активации',
    startTime: new Date('2023-11-28T15:00:00'),
    endTime: new Date('2023-11-28T15:45:00'),
    duration: 45,
    distance: 12.5,
    status: RideStatus.COMPLETED,
    cost: 225,
  },
  {
    id: '2',
    carId: '3',
    carName: 'Monster Truck Mini',
    startLocation: 'пр. Мира, 78',
    endLocation: 'ул. Гагарина, 23',
    startTime: new Date('2023-11-27T10:30:00'),
    endTime: new Date('2023-11-27T11:15:00'),
    duration: 45,
    distance: 8.3,
    status: RideStatus.COMPLETED,
    cost: 180,
  },
  {
    id: '3',
    carId: '1',
    carName: 'Cyber Racer X1',
    startLocation: 'ул. Кирова, 45',
    endLocation: 'ул. Советская, 12',
    startTime: new Date('2023-11-25T18:00:00'),
    endTime: new Date('2023-11-25T18:20:00'),
    duration: 20,
    distance: 5.0,
    status: RideStatus.CANCELLED,
    cost: 50,
  },
  {
    id: '4',
    carId: '4',
    carName: 'Stealth Ninja EV',
    startLocation: 'ул. Маяковского, 7',
    endLocation: '',
    startTime: new Date('2023-11-30T09:00:00'),
    endTime: null,
    duration: null,
    distance: null,
    status: RideStatus.SCHEDULED,
    cost: 0,
  },
  {
    id: '5',
    carId: '1',
    carName: 'Cyber Racer X1',
    startLocation: 'ул. Пушкина, 15',
    endLocation: '',
    startTime: new Date(), // текущее время
    endTime: null,
    duration: null,
    distance: null,
    status: RideStatus.ACTIVE,
    cost: 0,
  },
];

// Определяем фильтры для статусов поездок
const statusFilters = [
  { id: 'all', name: 'Все', color: '#FFFFFF', icon: 'list' },
  {
    id: RideStatus.SCHEDULED,
    name: 'Запланированные',
    color: '#007AFF',
    icon: 'calendar',
  },
  {
    id: RideStatus.ACTIVE,
    name: 'Активные',
    color: '#34C759',
    icon: 'play-circle',
  },
  {
    id: RideStatus.COMPLETED,
    name: 'Завершенные',
    color: '#8E8E93',
    icon: 'checkmark-circle',
  },
  {
    id: RideStatus.CANCELLED,
    name: 'Отмененные',
    color: '#FF3B30',
    icon: 'close-circle',
  },
];

export default function RidesHistoryScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | RideStatus>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<
    'day' | 'week' | 'month' | 'year'
  >('month');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      const mockRides: Ride[] = [
        {
          id: '1',
          carId: 'car1',
          carName: 'Tesla Model 3',
          startLocation: 'ул. Ленина, 10',
          endLocation: 'ул. Пушкина, 15',
          startTime: new Date('2023-07-26T14:30:00'),
          endTime: new Date('2023-07-26T15:15:00'),
          duration: 45,
          distance: 12.5,
          cost: 450,
          status: RideStatus.COMPLETED,
        },
        {
          id: '2',
          carId: 'car2',
          carName: 'BMW i3',
          startLocation: 'пр. Мира, 78',
          endLocation: 'ул. Гагарина, 23',
          startTime: new Date('2023-07-23T10:15:00'),
          endTime: new Date('2023-07-23T11:00:00'),
          duration: 45,
          distance: 8.3,
          cost: 300,
          status: RideStatus.COMPLETED,
        },
        {
          id: '3',
          carId: 'car3',
          carName: 'Tesla Model S',
          startLocation: 'ул. Кирова, 45',
          endLocation: 'ул. Советская, 12',
          startTime: new Date('2023-07-20T18:00:00'),
          endTime: null,
          duration: null,
          distance: null,
          cost: 0,
          status: RideStatus.CANCELLED,
        },
        {
          id: '4',
          carId: 'car4',
          carName: 'Audi e-tron',
          startLocation: 'ул. Маяковского, 7',
          endLocation: 'пр. Ленина, 56',
          startTime: new Date('2023-07-15T09:30:00'),
          endTime: new Date('2023-07-15T10:15:00'),
          duration: 45,
          distance: 14.7,
          cost: 520,
          status: RideStatus.COMPLETED,
        },
        {
          id: '5',
          carId: 'car1',
          carName: 'Tesla Model 3',
          startLocation: 'ул. Пушкина, 15',
          endLocation: 'ул. Достоевского, 8',
          startTime: new Date('2023-07-10T16:45:00'),
          endTime: new Date('2023-07-10T17:30:00'),
          duration: 45,
          distance: 10.2,
          cost: 380,
          status: RideStatus.COMPLETED,
        },
        {
          id: '6',
          carId: 'car5',
          carName: 'Mercedes EQC',
          startLocation: 'пр. Победы, 101',
          endLocation: '',
          startTime: new Date('2023-07-05T12:00:00'),
          endTime: null,
          duration: null,
          distance: null,
          cost: 0,
          status: RideStatus.CANCELLED,
        },
        {
          id: '7',
          carId: 'car6',
          carName: 'Nissan Leaf',
          startLocation: 'ул. Чехова, 33',
          endLocation: 'ул. Тургенева, 44',
          startTime: new Date('2023-06-28T14:15:00'),
          endTime: new Date('2023-06-28T15:00:00'),
          duration: 45,
          distance: 9.8,
          cost: 350,
          status: RideStatus.COMPLETED,
        },
        {
          id: '8',
          carId: 'car7',
          carName: 'Hyundai Kona Electric',
          startLocation: 'ул. Ленина, 23',
          endLocation: '',
          startTime: new Date(new Date().setHours(new Date().getHours() + 2)),
          endTime: null,
          duration: null,
          distance: null,
          cost: 0,
          status: RideStatus.SCHEDULED,
        },
        {
          id: '9',
          carId: 'car2',
          carName: 'BMW i3',
          startLocation: 'ул. Пушкина, 15',
          endLocation: '',
          startTime: new Date(),
          endTime: null,
          duration: null,
          distance: null,
          cost: 0,
          status: RideStatus.ACTIVE,
        },
      ];

      setRides(mockRides);
      setFilteredRides(mockRides);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    filterRides();
  }, [activeFilter, rides, sortDirection]);

  const filterRides = () => {
    let filtered = [...rides];

    // Фильтрация по статусу
    if (activeFilter !== 'all') {
      filtered = filtered.filter((ride) => ride.status === activeFilter);
    }

    // Сортировка по дате
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRides(filtered);
  };

  const getStatusText = (status: RideStatus) => {
    switch (status) {
      case RideStatus.SCHEDULED:
        return 'Запланирована';
      case RideStatus.ACTIVE:
        return 'Активная';
      case RideStatus.COMPLETED:
        return 'Завершена';
      case RideStatus.CANCELLED:
        return 'Отменена';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: RideStatus) => {
    switch (status) {
      case RideStatus.SCHEDULED:
        return '#007AFF';
      case RideStatus.ACTIVE:
        return '#34C759';
      case RideStatus.COMPLETED:
        return '#8E8E93';
      case RideStatus.CANCELLED:
        return '#FF3B30';
      default:
        return '#999999';
    }
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    }

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString('ru-RU', options);
  };

  const formatDuration = (minutes: number | null): string => {
    if (minutes === null) return '—';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} ч ${mins} мин`;
    } else {
      return `${mins} мин`;
    }
  };

  const formatDistance = (kilometers: number | null): string => {
    if (kilometers === null) return '—';
    return `${kilometers.toFixed(1)} км`;
  };

  const renderRideItem = ({ item }: { item: Ride }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() =>
        router.push({
          pathname: '/profile/ride-details',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideHeaderLeft}>
          <Text style={styles.carName}>{item.carName}</Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#9F9FAC" />
            <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.rideDetails}>
        <View style={styles.locationContainer}>
          <View style={styles.locationPoint}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.startLocation || 'Не указано'}
            </Text>
          </View>

          {item.status === RideStatus.COMPLETED && (
            <>
              <Ionicons
                name="git-commit-outline"
                size={14}
                color="#9F9FAC"
                style={styles.routeIcon}
              />

              <View style={styles.locationPoint}>
                <View
                  style={[styles.locationDot, { backgroundColor: '#00FFAA' }]}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.endLocation || item.startLocation || 'Не указано'}
                </Text>
              </View>
            </>
          )}

          {item.status === RideStatus.ACTIVE && (
            <View style={styles.activeRouteIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.activeRouteText}>В пути</Text>
            </View>
          )}
        </View>

        <View style={styles.rideStats}>
          {item.duration !== null && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#00FFAA" />
              <Text style={styles.statValue}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          )}

          {item.distance !== null && (
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={16} color="#00FFAA" />
              <Text style={styles.statValue}>
                {formatDistance(item.distance)}
              </Text>
            </View>
          )}

          {item.status === RideStatus.COMPLETED && (
            <View style={styles.statItem}>
              <Ionicons name="logo-usd" size={16} color="#00FFAA" />
              <Text style={styles.statValue}>{item.cost} монет</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150?text=No+Rides' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>Нет поездок</Text>
      <Text style={styles.emptyText}>
        У вас пока нет поездок за выбранный период или выбранного статуса
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'История поездок',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#121220',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
          },
        }}
      />
      <StatusBar style="light" />

      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterLabel}>Статус поездки:</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() =>
              setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
            }
          >
            <Ionicons
              name={sortDirection === 'desc' ? 'arrow-down' : 'arrow-up'}
              size={18}
              color="#00FFAA"
            />
            <Text style={styles.sortButtonText}>
              {sortDirection === 'desc' ? 'Новые' : 'Старые'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersGridContainer}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterGridItem,
                activeFilter === filter.id && {
                  backgroundColor: filter.color + '20',
                  borderColor: filter.color,
                },
              ]}
              onPress={() => setActiveFilter(filter.id as any)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={activeFilter === filter.id ? filter.color : '#9F9FAC'}
              />
              <Text
                style={[
                  styles.filterGridText,
                  activeFilter === filter.id && { color: filter.color },
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.periodContainer}>
        <Text style={styles.filterLabel}>Период:</Text>
        <View style={styles.periodButtonsRow}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'day' && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod('day')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'day' && styles.activePeriodText,
              ]}
            >
              День
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'week' && styles.activePeriodText,
              ]}
            >
              Неделя
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'month' && styles.activePeriodText,
              ]}
            >
              Месяц
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'year' && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'year' && styles.activePeriodText,
              ]}
            >
              Год
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Всего поездок</Text>
          <Text style={styles.summaryValue}>7</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общее расстояние</Text>
          <Text style={styles.summaryValue}>55.5 км</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Общие затраты</Text>
          <Text style={styles.summaryValue}>2000 ₽</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Загрузка поездок...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121220',
  },
  backButton: {
    marginLeft: 16,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filtersGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterGridText: {
    fontSize: 12,
    color: '#9F9FAC',
    marginLeft: 4,
    textAlign: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#00FFAA',
    marginLeft: 4,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#00FFAA',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9F9FAC',
  },
  activeFilterText: {
    color: '#121220',
    fontWeight: '500',
  },
  periodContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  periodButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 4,
  },
  activePeriodButton: {
    borderBottomColor: '#00FFAA',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#9F9FAC',
  },
  activePeriodText: {
    color: '#00FFAA',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    height: 24,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9F9FAC',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9F9FAC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  rideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideHeaderLeft: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#9F9FAC',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rideDetails: {
    marginTop: 8,
  },
  locationContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  locationPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  routeIcon: {
    marginLeft: 3,
    marginVertical: 2,
  },
  activeRouteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFAA',
    marginRight: 8,
  },
  activeRouteText: {
    fontSize: 14,
    color: '#00FFAA',
  },
  rideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
  },
});
