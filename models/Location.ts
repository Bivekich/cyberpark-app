import { z } from 'zod';

// Статусы локации
export enum LocationStatus {
  OPEN = 'open', // открыта
  CLOSED = 'closed', // закрыта
  MAINTENANCE = 'maintenance', // на техническом обслуживании
  COMING_SOON = 'coming_soon', // скоро открытие
}

// Схема для географических координат
export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Схема для валидации локации
export const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  coordinates: CoordinatesSchema,
  status: z.nativeEnum(LocationStatus),
  description: z.string().optional(),
  image: z.string().url().optional(),
  workingHours: z.string().optional(), // например "10:00-22:00"
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Тип для локации
export type Location = z.infer<typeof LocationSchema>;

// Тип для координат
export type Coordinates = z.infer<typeof CoordinatesSchema>;
