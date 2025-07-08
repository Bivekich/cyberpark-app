import * as SecureStore from 'expo-secure-store';
import { client } from './client';

class BalanceService {
  /**
   * Получение баланса пользователя
   */
  async getUserBalance(): Promise<number> {
    try {
      console.log('Balance Service: Fetching balance...');
      const response = await client.get('/payments/balance');

      console.log('Balance Service: Response received:', response.data);
      return response.data.balance || 0;
    } catch (error) {
      console.error('Balance Service: Error fetching user balance:', error);
      return 0;
    }
  }

  /**
   * Списание средств за поездку
   */
  async deductForRide(amount: number, carName: string, duration: number): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      console.log('Balance Service: Deducting for ride:', { amount, carName, duration });
      const response = await client.post('/payments/deduct-for-ride', {
        amount,
        carName,
        duration
      });

      console.log('Balance Service: Deduction response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Balance Service: Error deducting for ride:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Ошибка при списании средств'
      };
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