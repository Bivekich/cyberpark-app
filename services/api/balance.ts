import * as SecureStore from 'expo-secure-store';
import { client } from './client';

class BalanceService {
  /**
   * Получение баланса пользователя
   */
  async getUserBalance(): Promise<number> {
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('Balance Service: Token found:', !!token);

      const response = await client.get('/payments/balance', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log('Balance Service: Response received:', response.data);
      return response.data.balance || 0;
    } catch (error) {
      console.error('Balance Service: Error fetching user balance:', error);
      return 0;
    }
  }

  /**
   * Симуляция успешного платежа (для тестирования)
   */
  async simulatePaymentSuccess(paymentId: string): Promise<boolean> {
    try {
      const response = await client.post(`/payments/simulate-success/${paymentId}`);
      console.log('Payment simulation successful:', response.data);
      return true;
    } catch (error) {
      console.error('Error simulating payment success:', error);
      return false;
    }
  }
}

export const balanceService = new BalanceService(); 