import { z } from 'zod';

// Типы транзакций
export enum TransactionType {
  DEPOSIT = 'deposit', // пополнение
  WITHDRAWAL = 'withdrawal', // списание за поездку
  TRANSFER = 'transfer', // перевод другому пользователю
  BONUS = 'bonus', // бонус
  PENALTY = 'penalty', // штраф
}

// Статусы транзакций
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

// Схема для валидации транзакции
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  status: z.nativeEnum(TransactionStatus),
  description: z.string().optional(),
  recipientId: z.string().uuid().optional(), // для переводов
  createdAt: z.date(),
  updatedAt: z.date(),
  rideId: z.string().uuid().optional(), // ID поездки, если транзакция связана с поездкой
});

// Тип для транзакции
export type Transaction = z.infer<typeof TransactionSchema>;

// Интерфейс для фильтрации транзакций
export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  status?: TransactionStatus;
}
