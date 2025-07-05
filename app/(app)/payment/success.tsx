import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { paymentsService } from '@/services/api/payments';
import { balanceService } from '@/services/api/balance';
import { StatusBar } from 'expo-status-bar';

export default function PaymentSuccessScreen() {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [creditedAmount, setCreditedAmount] = useState<number | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const simulatePaymentCompletion = async () => {
    const paymentId = params.payment_id as string || 'mock-payment-id';
    
    try {
      setLoading(true);
      const success = await balanceService.simulatePaymentSuccess(paymentId);
      if (success) {
        setPaymentStatus('success');
        setErrorMessage('');
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Не удалось завершить платеж');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('Ошибка при завершении платежа');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      // Получаем ID платежа из параметров URL
      const paymentId = params.payment_id as string;
      
      if (paymentId) {
        // Проверяем статус платежа
        const status = await paymentsService.checkPaymentStatus(paymentId);
        
        if (status === 'succeeded') {
          setPaymentStatus('success');
          try {
            const payment = await paymentsService.getPayment(paymentId);
            setCreditedAmount(parseFloat(payment.amount.value));
          } catch {}
        } else if (status === 'pending') {
          setPaymentStatus('pending');
          // Можно добавить повторную проверку через некоторое время
          setTimeout(() => checkPaymentStatus(), 3000);
          return;
        } else {
          setPaymentStatus('failed');
          setErrorMessage('Платеж был отклонен или отменен');
        }
      } else {
        // Если нет ID платежа, считаем что платеж успешен (возможно, пользователь вернулся после оплаты)
        setPaymentStatus('success');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
      setErrorMessage('Не удалось проверить статус платежа');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/(app)');
  };

  const handleGoToProfile = () => {
    router.replace('/(app)/profile');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text style={styles.loadingText}>Проверяем статус платежа...</Text>
        </View>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#00FFAA" />
          </View>
          <Text style={styles.successTitle}>Платеж успешен!</Text>
          <Text style={styles.successText}>
            {creditedAmount !== null
              ? `Ваш баланс будет пополнен на ${creditedAmount.toFixed(2)} ₽. В скором времени изменения отобразятся.`
              : 'Ваш баланс был пополнен. В скором времени изменения отобразятся.'}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
              <Text style={styles.primaryButtonText}>На главную</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToProfile}>
              <Text style={styles.secondaryButtonText}>Мой профиль</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (paymentStatus === 'pending') {
      return (
        <View style={styles.centerContent}>
          <View style={styles.pendingIcon}>
            <Ionicons name="hourglass-outline" size={80} color="#FF9500" />
          </View>
          <Text style={styles.pendingTitle}>Платеж обрабатывается</Text>
          <Text style={styles.pendingText}>
            Ваш платеж находится в обработке. Пожалуйста, подождите...
          </Text>
          <ActivityIndicator size="small" color="#FF9500" style={styles.pendingLoader} />
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={simulatePaymentCompletion}
          >
            <Text style={styles.testButtonText}>Завершить платеж (тест)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Failed status
    return (
      <View style={styles.centerContent}>
        <View style={styles.errorIcon}>
          <Ionicons name="close-circle" size={80} color="#FF3B30" />
        </View>
        <Text style={styles.errorTitle}>Ошибка платежа</Text>
        <Text style={styles.errorText}>
          {errorMessage || 'Произошла ошибка при обработке платежа. Попробуйте еще раз.'}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
            <Text style={styles.primaryButtonText}>На главную</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push('/(app)/profile/deposit')}
          >
            <Text style={styles.secondaryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleGoHome}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Результат платежа</Text>
          <View style={styles.placeholder} />
        </View>
        {renderContent()}
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
  closeButton: {
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
  placeholder: {
    width: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  pendingIcon: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFAA',
    marginBottom: 16,
    textAlign: 'center',
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  pendingText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9F9FAC',
    marginTop: 16,
  },
  pendingLoader: {
    marginTop: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  testButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  testButtonText: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
  },
}); 