// URL API для разработки и продакшн сред
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://cyberpark-api.example.com/api';

// Таймаут для запросов (миллисекунды)
export const API_TIMEOUT = 15000;

// Константы для эндпоинтов
export const API_ENDPOINTS = {
  // Аутентификация
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Пользователи
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    BALANCE: '/users/balance',
    DEPOSIT: '/users/balance/deposit',
  },

  // Машины
  CARS: {
    LIST: '/cars',
    DETAILS: (id: string) => `/cars/${id}`,
    RENT: (id: string) => `/cars/${id}/rent`,
    RETURN: (id: string) => `/cars/${id}/return`,
    CONTROL: (id: string) => `/cars/${id}/control`,
  },

  // Поездки
  RIDES: {
    LIST: '/rides',
    DETAILS: (id: string) => `/rides/${id}`,
    CURRENT: '/rides/current',
  },

  // Транзакции
  TRANSACTIONS: {
    LIST: '/transactions',
    DETAILS: (id: string) => `/transactions/${id}`,
  },

  // Уведомления
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
  },
};
