import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { paymentsService, PaymentResponse } from '@/services/api/payments';

export default function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const history = await paymentsService.getPaymentHistory({ limit: 100 });
      setPayments(history.items);
    } catch (error) {
      console.error('Error loading payment history:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить историю платежей');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '#00FFAA';
      case 'pending':
      case 'waiting_for_capture':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      case 'canceled':
        return '#FF3B30';
      default:
        return '#9F9FAC';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Успешно';
      case 'pending':
        return 'В обработке';
      case 'waiting_for_capture':
        return 'Ожидает подтверждения';
      case 'failed':
        return 'Ошибка';
      case 'canceled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'checkmark-circle';
      case 'pending':
      case 'waiting_for_capture':
        return 'hourglass';
      case 'failed':
        return 'close-circle';
      case 'canceled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePaymentPress = (payment: PaymentResponse) => {
    Alert.alert(
      'Детали платежа',
      `ID: ${payment.id}\nСтатус: ${getStatusText(payment.status)}\nСумма: ${payment.amount.value} ${payment.amount.currency}\nДата: ${formatDate(payment.created_at)}\nОписание: ${payment.description}`,
      [
        { text: 'OK' },
        ...(payment.status === 'succeeded' ? [{ 
          text: 'Возврат', 
          onPress: () => handleRefund(payment),
          style: 'destructive' as const
        }] : [])
      ]
    );
  };

  const handleRefund = (payment: PaymentResponse) => {
    Alert.alert(
      'Возврат средств',
      `Вы уверены, что хотите вернуть ${payment.amount.value} ${payment.amount.currency}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Вернуть',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentsService.createRefund(payment.id);
              Alert.alert('Успешно', 'Запрос на возврат создан');
              loadPaymentHistory();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось создать возврат');
            }
          }
        }
      ]
    );
  };

  const renderPaymentItem = ({ item }: { item: PaymentResponse }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(item)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.paymentDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>
            {item.amount.value} {item.amount.currency}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons
              name={getStatusIcon(item.status)}
              size={12}
              color={getStatusColor(item.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={80} color="#9F9FAC" />
      <Text style={styles.emptyTitle}>Нет платежей</Text>
      <Text style={styles.emptyText}>
        Здесь будет отображаться история ваших платежей
      </Text>
      <TouchableOpacity
        style={styles.addPaymentButton}
        onPress={() => router.push('/(app)/profile/deposit')}
      >
        <Text style={styles.addPaymentButtonText}>Пополнить баланс</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>История платежей</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FFAA" />
            <Text style={styles.loadingText}>Загружаем историю платежей...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>История платежей</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(app)/profile/deposit')}
          >
            <Ionicons name="add" size={24} color="#00FFAA" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00FFAA']}
              tintColor="#00FFAA"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
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
    padding: 20,
  },
  paymentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#9F9FAC',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFAA',
    marginBottom: 8,
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
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    marginBottom: 32,
  },
  addPaymentButton: {
    backgroundColor: '#00FFAA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPaymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
}); 