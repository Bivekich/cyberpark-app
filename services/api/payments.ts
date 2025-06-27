import * as SecureStore from 'expo-secure-store';
import { client } from './client';

// Payment interfaces
export interface PaymentAmount {
  value: string;
  currency: 'RUB' | 'USD' | 'EUR';
}

export interface PaymentMethod {
  type: 'bank_card' | 'yoo_money' | 'qiwi' | 'webmoney' | 'alfabank' | 'sberbank';
  name: string;
}

export interface PaymentConfirmation {
  type: 'redirect' | 'embedded';
  return_url?: string;
  confirmation_url?: string;
  confirmation_token?: string;
}

export interface CreatePaymentRequest {
  amount: {
    value: string;
    currency: 'RUB' | 'USD' | 'EUR';
  };
  payment_method_data?: {
    type: 'bank_card' | 'yoo_money' | 'qiwi' | 'webmoney' | 'alfabank' | 'sberbank';
  };
  confirmation: {
    type: 'redirect' | 'embedded';
    return_url?: string;
  };
  description: string;
  capture?: boolean;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url?: string;
    confirmation_token?: string;
  };
  created_at: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface RefundRequest {
  payment_id: string;
  amount?: PaymentAmount;
  description?: string;
  receipt?: {
    customer: {
      email?: string;
      phone?: string;
    };
    items: Array<{
      description: string;
      quantity: string;
      amount: PaymentAmount;
      vat_code: number;
    }>;
  };
}

export interface RefundResponse {
  id: string;
  payment_id: string;
  status: 'pending' | 'succeeded' | 'canceled';
  amount: PaymentAmount;
  description?: string;
  created_at: string;
  receipt_registration?: string;
}

export interface DepositRequest {
  amount: number;
  currency?: 'RUB' | 'USD' | 'EUR';
  payment_method?: 'bank_card' | 'yoo_money' | 'qiwi' | 'sberbank';
  return_url?: string;
  description?: string;
}

export interface PaymentHistoryFilter {
  status?: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  created_at_gte?: string;
  created_at_lte?: string;
  limit?: number;
  cursor?: string;
}

export interface PaymentHistory {
  items: PaymentResponse[];
  has_next: boolean;
  next_cursor?: string;
}

/**
 * Сервис для работы с платежами через UKASSA (YooKassa)
 */
class PaymentsService {
  /**
   * Создание платежа для пополнения баланса
   */
  async createTopupPayment(
    amount: number,
    paymentType: string = 'bank_card',
    returnUrl?: string
  ): Promise<PaymentResponse> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const paymentData: CreatePaymentRequest = {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        payment_method_data: {
          type: paymentType as any,
        },
        confirmation: {
          type: 'redirect',
          return_url: returnUrl || 'https://cyberpark.app/payment/success',
        },
        description: `Пополнение баланса CyberPark на ${amount} рублей`,
        capture: true,
      };

      const response = await client.post('/payments/create', paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Не удалось создать платеж');
    }
  }

  /**
   * Получение информации о платеже
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await client.get(`/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Платеж не найден');
    }
  }

  /**
   * Получение доступных методов платежа
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await client.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [
        { type: 'bank_card', name: 'Банковская карта' },
        { type: 'yoo_money', name: 'ЮMoney' },
        { type: 'sberbank', name: 'Сбербанк Онлайн' },
      ];
    }
  }

  /**
   * Получение истории платежей
   */
  async getPaymentHistory(filter?: any): Promise<PaymentHistory> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const response = await client.get('/payments/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filter,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        items: [],
        has_next: false,
      };
    }
  }

  /**
   * Создание возврата
   */
  async createRefund(paymentId: string, amount?: number, description?: string): Promise<any> {
    try {
      const token = await SecureStore.getItemAsync('token');

      const refundData = {
        payment_id: paymentId,
        ...(amount && { 
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          }
        }),
        description: description || 'Возврат средств CyberPark',
      };

      const response = await client.post('/payments/refund', refundData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Не удалось создать возврат');
    }
  }

  /**
   * Проверка статуса платежа (для мониторинга)
   */
  async checkPaymentStatus(paymentId: string): Promise<'pending' | 'succeeded' | 'canceled'> {
    try {
      const payment = await this.getPayment(paymentId);
      return payment.status as any;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return 'canceled';
    }
  }
}

export const paymentsService = new PaymentsService(); 