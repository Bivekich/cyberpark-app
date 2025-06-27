import * as SecureStore from 'expo-secure-store';
import { client } from './client';
import {
  Transaction,
  TransactionFilter,
  TransactionType,
  TransactionStatus,
} from '@/models/Transaction';

export interface BackendTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'ride_payment' | 'refund' | 'bonus' | 'penalty';
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  paymentId?: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

class TransactionsService {
  /**
   * Получение транзакций пользователя
   */
  async getTransactions(filter?: TransactionFilter): Promise<BackendTransaction[]> {
    try {
      const token = await SecureStore.getItemAsync('token');
      
      const response = await client.get('/payments/transactions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: filter,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * Получение баланса пользователя
   */
  async getUserBalance(): Promise<number> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await client.get('/payments/balance', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      return response.data.balance || 0;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  /**
   * Симуляция успешного платежа (для тестирования)
   */
  async simulatePaymentSuccess(paymentId: string): Promise<boolean> {
    try {
      const response = await client.post(`/payments/simulate-success/${paymentId}`);
      return true;
    } catch (error) {
      console.error('Error simulating payment success:', error);
      return false;
    }
  }

  /**
   * Конвертация типа транзакции из backend в frontend
   */
  mapTransactionType(backendType: string): TransactionType {
    switch (backendType) {
      case 'deposit':
        return TransactionType.DEPOSIT;
      case 'withdrawal':
      case 'ride_payment':
        return TransactionType.WITHDRAWAL;
      case 'bonus':
        return TransactionType.BONUS;
      case 'penalty':
        return TransactionType.PENALTY;
      default:
        return TransactionType.DEPOSIT;
    }
  }

  /**
   * Конвертация статуса транзакции из backend в frontend
   */
  mapTransactionStatus(backendStatus: string): TransactionStatus {
    switch (backendStatus) {
      case 'completed':
        return TransactionStatus.COMPLETED;
      case 'pending':
        return TransactionStatus.PENDING;
      case 'failed':
        return TransactionStatus.FAILED;
      case 'canceled':
        return TransactionStatus.CANCELED;
      default:
        return TransactionStatus.PENDING;
    }
  }

  /**
   * Конвертация транзакций из backend формата в frontend
   */
  convertBackendTransactions(backendTransactions: BackendTransaction[]): Transaction[] {
    return backendTransactions.map(bt => ({
      id: bt.id,
      userId: bt.userId,
      type: this.mapTransactionType(bt.type),
      amount: bt.amount,
      status: this.mapTransactionStatus(bt.status),
      description: bt.description,
      createdAt: new Date(bt.createdAt),
      updatedAt: new Date(bt.createdAt), // Use same date as created
    }));
  }

  // Legacy methods for compatibility
  async transferMoney(
    recipientId: string,
    amount: number,
    description?: string
  ): Promise<boolean> {
    console.warn('Transfer money not implemented yet');
    return false;
  }

  async depositBalance(
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    console.warn('Use paymentsService.createTopupPayment instead');
    return false;
  }
}

export const transactionsService = new TransactionsService();
