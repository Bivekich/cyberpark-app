import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Типы для транзакций
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  RIDE_PAYMENT = 'RIDE_PAYMENT',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  description: string;
  rideId?: string;
}

// Тестовые данные для демонстрации
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    userId: 'user1',
    amount: 500,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date('2023-11-29T14:30:00'),
    description: 'Пополнение счета',
  },
  {
    id: '2',
    userId: 'user1',
    amount: -225,
    type: TransactionType.RIDE_PAYMENT,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date('2023-11-28T16:00:00'),
    description: 'Оплата поездки #DR28112023',
    rideId: '1',
  },
  {
    id: '3',
    userId: 'user1',
    amount: -180,
    type: TransactionType.RIDE_PAYMENT,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date('2023-11-27T11:30:00'),
    description: 'Оплата поездки #MT27112023',
    rideId: '2',
  },
  {
    id: '4',
    userId: 'user1',
    amount: 50,
    type: TransactionType.REFUND,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date('2023-11-25T18:30:00'),
    description: 'Возврат за отмененную поездку',
    rideId: '3',
  },
  {
    id: '5',
    userId: 'user1',
    amount: 100,
    type: TransactionType.BONUS,
    status: TransactionStatus.COMPLETED,
    createdAt: new Date('2023-11-24T10:15:00'),
    description: 'Бонус за первую поездку',
  },
  {
    id: '6',
    userId: 'user1',
    amount: 300,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.PENDING,
    createdAt: new Date('2023-11-30T09:30:00'),
    description: 'Пополнение счета (в обработке)',
  },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | TransactionType>(
    'all'
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    'day' | 'week' | 'month' | 'year'
  >('month');

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          userId: 'user1',
          amount: 1000,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-25T14:30:00'),
          description: 'Пополнение баланса',
        },
        {
          id: '2',
          userId: 'user1',
          amount: -450,
          type: TransactionType.RIDE_PAYMENT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-23T15:15:00'),
          description: 'Оплата поездки: Tesla Model 3',
          rideId: '1',
        },
        {
          id: '3',
          userId: 'user1',
          amount: -300,
          type: TransactionType.RIDE_PAYMENT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-20T10:45:00'),
          description: 'Оплата поездки: BMW i3',
          rideId: '2',
        },
        {
          id: '4',
          userId: 'user1',
          amount: 600,
          type: TransactionType.REFUND,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-18T19:50:00'),
          description: 'Возврат средств за отмененную поездку',
          rideId: '3',
        },
        {
          id: '5',
          userId: 'user1',
          amount: -200,
          type: TransactionType.RIDE_PAYMENT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-15T09:50:00'),
          description: 'Оплата поездки: Tesla Model S',
          rideId: '4',
        },
        {
          id: '6',
          userId: 'user1',
          amount: 2000,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-12T11:20:00'),
          description: 'Пополнение баланса',
          rideId: '5',
        },
        {
          id: '7',
          userId: 'user1',
          amount: 500,
          type: TransactionType.BONUS,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-10T16:55:00'),
          description: 'Бонус за приглашение друга',
          rideId: '6',
        },
        {
          id: '8',
          userId: 'user1',
          amount: -150,
          type: TransactionType.PENALTY,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-07-05T12:15:00'),
          description: 'Штраф за несоблюдение правил парковки',
          rideId: '7',
        },
        {
          id: '9',
          userId: 'user1',
          amount: 1500,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2023-06-28T11:45:00'),
          description: 'Пополнение баланса',
          rideId: '8',
        },
        {
          id: '10',
          userId: 'user1',
          amount: -380,
          type: TransactionType.RIDE_PAYMENT,
          status: TransactionStatus.PENDING,
          createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
          description: 'Оплата поездки: Mercedes EQC',
          rideId: '9',
        },
      ];

      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [activeFilter, transactions]);

  const filterTransactions = () => {
    if (activeFilter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) => transaction.type === activeFilter
      );
      setFilteredTransactions(filtered);
    }
  };

  const getTypeText = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Пополнение';
      case TransactionType.RIDE_PAYMENT:
        return 'Оплата поездки';
      case TransactionType.REFUND:
        return 'Возврат';
      case TransactionType.BONUS:
        return 'Бонус';
      case TransactionType.PENALTY:
        return 'Штраф';
      default:
        return 'Неизвестно';
    }
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'arrow-down-outline';
      case TransactionType.RIDE_PAYMENT:
        return 'car-outline';
      case TransactionType.REFUND:
        return 'refresh-outline';
      case TransactionType.BONUS:
        return 'gift-outline';
      case TransactionType.PENALTY:
        return 'warning-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return '#34C759';
      case TransactionType.RIDE_PAYMENT:
        return '#FF3B30';
      case TransactionType.REFUND:
        return '#34C759';
      case TransactionType.BONUS:
        return '#34C759';
      case TransactionType.PENALTY:
        return '#FF3B30';
      default:
        return '#999999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Выполнено';
      case 'pending':
        return 'В обработке';
      case 'failed':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'pending':
        return '#FFCC00';
      case 'failed':
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

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => {
        if (item.rideId) {
          router.push({
            pathname: '/profile/ride-details',
            params: { id: item.rideId },
          });
        }
      }}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>{getTypeIcon(item.type)}</View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.transactionAmount,
              item.amount > 0 ? styles.positiveAmount : styles.negativeAmount,
            ]}
          >
            {item.amount > 0 ? '+' : ''}
            {item.amount} монет
          </Text>
          {item.status === TransactionStatus.PENDING && (
            <Text style={styles.pendingStatus}>В обработке</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://via.placeholder.com/150?text=No+Transactions' }}
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>Нет транзакций</Text>
      <Text style={styles.emptyText}>
        У вас пока нет транзакций за выбранный период или выбранного типа
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'История транзакций',
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
        <Text style={styles.filterLabel}>Тип транзакции:</Text>
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              Все
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TransactionType.DEPOSIT &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TransactionType.DEPOSIT)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TransactionType.DEPOSIT &&
                  styles.activeFilterText,
              ]}
            >
              Пополнения
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TransactionType.RIDE_PAYMENT &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TransactionType.RIDE_PAYMENT)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TransactionType.RIDE_PAYMENT &&
                  styles.activeFilterText,
              ]}
            >
              Оплаты
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TransactionType.REFUND &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TransactionType.REFUND)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TransactionType.REFUND &&
                  styles.activeFilterText,
              ]}
            >
              Возвраты
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TransactionType.BONUS &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TransactionType.BONUS)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TransactionType.BONUS &&
                  styles.activeFilterText,
              ]}
            >
              Бонусы
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TransactionType.PENALTY &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TransactionType.PENALTY)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TransactionType.PENALTY &&
                  styles.activeFilterText,
              ]}
            >
              Штрафы
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.summaryLabel}>Пополнения</Text>
          <Text style={[styles.summaryValue, { color: '#34C759' }]}>
            +4500 монет
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Списания</Text>
          <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
            -1480 монет
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Итого</Text>
          <Text style={styles.summaryValue}>+3020 монет</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Загрузка транзакций...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
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
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
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
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9F9FAC',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  positiveAmount: {
    color: '#00FFAA',
  },
  negativeAmount: {
    color: '#FF453A',
  },
  pendingStatus: {
    fontSize: 12,
    color: '#FF9500',
    textAlign: 'right',
    marginTop: 4,
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
