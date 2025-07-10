import { z } from 'zod';

// Статусы машинки
export enum CarStatus {
  AVAILABLE = 'available', // доступна для бронирования
  RESERVED = 'reserved', // зарезервирована (до 10 минут)
  BUSY = 'busy', // занята другим пользователем
  CHARGING = 'charging', // на зарядке
  MAINTENANCE = 'maintenance', // на техническом обслуживании
  OFFLINE = 'offline', // не в сети
}

// Схема для валидации машинки
export const CarSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  locationId: z.string().uuid().nullable(), // Allow null locationId
  status: z.nativeEnum(CarStatus),
  batteryLevel: z.number().min(0).max(100), // процент заряда
  maxSpeed: z.number().positive(), // максимальная скорость
  image: z.string().url().optional(),
  minLevel: z.number().min(0), // минимальный уровень пользователя для старта
  description: z.string().optional(),
  pricePerMinute: z.number().positive(), // цена за минуту
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Тип для машинки
export type Car = z.infer<typeof CarSchema>;

// Интерфейс для фильтрации машинок
export interface CarFilter {
  locationId?: string;
  status?: CarStatus;
  minBatteryLevel?: number;
  maxPricePerMinute?: number;
  searchTerm?: string;
}
