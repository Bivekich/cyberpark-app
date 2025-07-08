import { z } from 'zod';

// Статусы резервации
export enum ReservationStatus {
  ACTIVE = 'active', // активная резервация
  EXPIRED = 'expired', // истекшая резервация
  USED = 'used', // резервация использована (поездка началась)
  CANCELED = 'canceled', // отменена пользователем
}

// Схема для валидации резервации
export const ReservationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  carId: z.string().uuid(),
  carUnitId: z.string().uuid().optional(), // specific car unit assigned to user
  locationId: z.string().uuid().optional(), // made optional since backend doesn't track this yet
  startTime: z.date(), // время создания резервации
  expiresAt: z.date(), // время истечения (startTime + 10 минут)
  status: z.nativeEnum(ReservationStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Тип для резервации
export type Reservation = z.infer<typeof ReservationSchema>;

// Интерфейс для создания новой резервации
export interface CreateReservationRequest {
  carId: string;
}

// Интерфейс для фильтрации резерваций
export interface ReservationFilter {
  status?: ReservationStatus;
  carId?: string;
  startDate?: Date;
  endDate?: Date;
} 