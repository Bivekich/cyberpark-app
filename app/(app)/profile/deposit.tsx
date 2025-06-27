import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { paymentsService, PaymentMethod } from '@/services/api/payments';

type LocalPaymentMethod = 'card' | 'transfer' | 'cash';

export default function DepositScreen() {
  const [amount, setAmount] = useState('500');
  const [selectedMethod, setSelectedMethod] = useState<LocalPaymentMethod>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/profile');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentsService.getPaymentMethods();
      setAvailableMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    if (Number(amount) < 100) {
      Alert.alert('Ошибка', 'Минимальная сумма пополнения 100 рублей');
      return;
    }

    setIsLoading(true);

    try {
      // Определяем тип платежа на основе выбранного метода
      let paymentType = 'bank_card';
      if (selectedMethod === 'transfer') {
        paymentType = 'sberbank'; // СБП через Сбербанк
      } else if (selectedMethod === 'cash') {
        Alert.alert('Информация', 'Пополнение наличными доступно только в парке');
        setIsLoading(false);
        return;
      }

      // Создаем платеж через YooKassa
      const payment = await paymentsService.createTopupPayment(
        Number(amount),
        paymentType,
        'cyberpark://payment/success'
      );

      setIsLoading(false);

      if (payment.confirmation?.confirmation_url) {
        // Открываем страницу оплаты
        const supported = await Linking.canOpenURL(payment.confirmation.confirmation_url);
        
        if (supported) {
          await Linking.openURL(payment.confirmation.confirmation_url);
          
          // Показываем информацию о переходе к оплате
          Alert.alert(
            'Переход к оплате',
            'Вы будете перенаправлены на страницу оплаты. После успешной оплаты вернитесь в приложение.',
            [
              { text: 'OK', onPress: handleGoBack }
            ]
          );
        } else {
          Alert.alert('Ошибка', 'Не удалось открыть страницу оплаты');
        }
      } else {
        Alert.alert('Ошибка', 'Не удалось получить ссылку для оплаты');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Payment error:', error);
      Alert.alert('Ошибка', 'Не удалось создать платеж. Попробуйте позже.');
    }
  };

  const renderPaymentMethods = () => {
    return (
      <View style={styles.methodsContainer}>
        <TouchableOpacity
          style={[
            styles.methodItem,
            selectedMethod === 'card' && styles.selectedMethod,
          ]}
          onPress={() => setSelectedMethod('card')}
        >
          <Ionicons
            name="card-outline"
            size={28}
            color={selectedMethod === 'card' ? '#00FFAA' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.methodTitle,
              selectedMethod === 'card' && styles.selectedMethodText,
            ]}
          >
            Карта
          </Text>
          <Text style={styles.methodDescription}>Visa, MasterCard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodItem,
            selectedMethod === 'transfer' && styles.selectedMethod,
          ]}
          onPress={() => setSelectedMethod('transfer')}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={28}
            color={selectedMethod === 'transfer' ? '#00FFAA' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.methodTitle,
              selectedMethod === 'transfer' && styles.selectedMethodText,
            ]}
          >
            СБП
          </Text>
          <Text style={styles.methodDescription}>Быстрый перевод</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodItem,
            selectedMethod === 'cash' && styles.selectedMethod,
          ]}
          onPress={() => setSelectedMethod('cash')}
        >
          <Ionicons
            name="cash-outline"
            size={28}
            color={selectedMethod === 'cash' ? '#00FFAA' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.methodTitle,
              selectedMethod === 'cash' && styles.selectedMethodText,
            ]}
          >
            Наличные
          </Text>
          <Text style={styles.methodDescription}>В парке</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Пополнение баланса</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Сумма пополнения</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#9F9FAC"
              />
              <Text style={styles.currencyText}>монет</Text>
            </View>
          </View>

          <View style={styles.presetAmounts}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setAmount('100')}
            >
              <Text style={styles.presetText}>100</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setAmount('300')}
            >
              <Text style={styles.presetText}>300</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setAmount('500')}
            >
              <Text style={styles.presetText}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setAmount('1000')}
            >
              <Text style={styles.presetText}>1000</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Способ оплаты</Text>
          {renderPaymentMethods()}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              1 монета = 1 рубль. Минимальная сумма пополнения 100 монет.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handleDeposit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#121220" />
            ) : (
              <Text style={styles.payButtonText}>Пополнить баланс</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountContainer: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#9F9FAC',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    height: 60,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyText: {
    fontSize: 18,
    color: '#9F9FAC',
  },
  presetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  presetButton: {
    width: '22%',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  methodsContainer: {
    marginBottom: 24,
  },
  methodItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedMethod: {
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFAA',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 16,
    marginRight: 8,
  },
  selectedMethodText: {
    color: '#00FFAA',
  },
  methodDescription: {
    fontSize: 14,
    color: '#9F9FAC',
    marginLeft: 'auto',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#9F9FAC',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
});
