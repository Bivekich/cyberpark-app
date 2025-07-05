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
import { transactionsService } from '@/services/api';
import { Transaction as TxModel, TransactionType as TxType, TransactionStatus as TxStatus } from '@/models/Transaction';

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TxModel[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    TxModel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | TxType>(
    'all'
  );
  const [selectedPeriod, setSelectedPeriod] = useState<
    'day' | 'week' | 'month' | 'year'
  >('month');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const backendTx = await transactionsService.getTransactions({ limit: 100 } as any);
        const converted = transactionsService.convertBackendTransactions(backendTx);
        setTransactions(converted);
        setFilteredTransactions(converted);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    })();
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

  const getTypeText = (type: TxType) => {
    switch (type) {
      case TxType.DEPOSIT:
        return 'Пополнение';
      case TxType.WITHDRAWAL:
        return 'Списание';
      case TxType.TRANSFER:
        return 'Перевод';
      case TxType.BONUS:
        return 'Бонус';
      case TxType.PENALTY:
        return 'Штраф';
      default:
        return 'Неизвестно';
    }
  };

  const getTypeIcon = (type: TxType) => {
    switch (type) {
      case TxType.DEPOSIT:
        return 'arrow-down-outline';
      case TxType.WITHDRAWAL:
        return 'car-outline';
      case TxType.TRANSFER:
        return 'swap-horizontal';
      case TxType.BONUS:
        return 'gift-outline';
      case TxType.PENALTY:
        return 'warning-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getTypeColor = (type: TxType) => {
    switch (type) {
      case TxType.DEPOSIT:
        return '#34C759';
      case TxType.WITHDRAWAL:
        return '#FF3B30';
      case TxType.TRANSFER:
        return '#34C759';
      case TxType.BONUS:
        return '#34C759';
      case TxType.PENALTY:
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

  const renderTransactionItem = ({ item }: { item: TxModel }) => (
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
          {item.status === TxStatus.PENDING && (
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
              activeFilter === TxType.DEPOSIT &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TxType.DEPOSIT)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TxType.DEPOSIT &&
                  styles.activeFilterText,
              ]}
            >
              Пополнения
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TxType.WITHDRAWAL &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TxType.WITHDRAWAL)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TxType.WITHDRAWAL &&
                  styles.activeFilterText,
              ]}
            >
              Списания
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TxType.TRANSFER &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TxType.TRANSFER)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TxType.TRANSFER &&
                  styles.activeFilterText,
              ]}
            >
              Переводы
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TxType.BONUS &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TxType.BONUS)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TxType.BONUS &&
                  styles.activeFilterText,
              ]}
            >
              Бонусы
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === TxType.PENALTY &&
                styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(TxType.PENALTY)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeFilter === TxType.PENALTY &&
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
