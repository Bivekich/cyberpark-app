import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  Transaction,
  TransactionFilter,
  TransactionType,
} from '@/models/Transaction';

const API_URL = process.env.API_URL || 'http://localhost:3000';

class TransactionsService {
  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filter,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async transferMoney(
    recipientId: string,
    amount: number,
    description?: string
  ): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      await axios.post(
        `${API_URL}/transactions/transfer`,
        {
          recipientId,
          amount,
          description,
          type: TransactionType.TRANSFER,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Error transferring money:', error);
      return false;
    }
  }

  async depositBalance(
    amount: number,
    paymentMethod: string
  ): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('token');

      await axios.post(
        `${API_URL}/transactions/deposit`,
        {
          amount,
          paymentMethod,
          type: TransactionType.DEPOSIT,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Error depositing balance:', error);
      return false;
    }
  }

  async getUserBalance(): Promise<number> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await axios.get(`${API_URL}/users/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.balance;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }
}

export const transactionsService = new TransactionsService();
