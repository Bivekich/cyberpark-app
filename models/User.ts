import { z } from 'zod';

// Статусы пользователя
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

// Схема для валидации пользователя
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  balance: z.number().default(0), // баланс пользователя в монетах
  level: z.number().default(1), // уровень пользователя
  experience: z.number().default(0), // опыт пользователя
  telegramId: z.string().optional(), // идентификатор пользователя в Telegram
  appleId: z.string().optional(), // идентификатор пользователя в Apple
  googleId: z.string().optional(), // идентификатор пользователя в Google
  avatar: z.string().url().optional(), // URL аватара пользователя
  phone: z.string().optional(), // телефон пользователя
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

// Тип для пользователя
export type User = z.infer<typeof UserSchema>;

// Схема настроек пользователя
export const UserSettingsSchema = z.object({
  userId: z.string().uuid(),
  notificationsEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  language: z.string().default('ru'),
  videoQuality: z.enum(['auto', 'low', 'medium', 'high']).default('auto'),
  soundEnabled: z.boolean().default(true),
});

// Тип для настроек пользователя
export type UserSettings = z.infer<typeof UserSettingsSchema>;
