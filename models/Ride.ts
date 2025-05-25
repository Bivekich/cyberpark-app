import { z } from 'zod';

// Статусы поездки
export enum RideStatus {
  SCHEDULED = 'scheduled', // запланирована
  ACTIVE = 'active', // активна
  COMPLETED = 'completed', // завершена
  CANCELED = 'canceled', // отменена
}

// Схема для валидации поездки
export const RideSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  carId: z.string().uuid(),
  locationId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date().optional(), // может быть не установлено до завершения
  duration: z.number().optional(), // в секундах
  status: z.nativeEnum(RideStatus),
  cost: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Тип для поездки
export type Ride = z.infer<typeof RideSchema>;

// Интерфейс для фильтрации поездок
export interface RideFilter {
  startDate?: Date;
  endDate?: Date;
  status?: RideStatus;
  locationId?: string;
}
