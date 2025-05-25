import * as SecureStore from 'expo-secure-store';

// Константы ключей для хранения
const KEYS = {
  AUTH_TOKEN: 'AUTH_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  USER_ID: 'USER_ID',
};

// Функции для хранения и получения токенов авторизации
const secureStorage = {
  // Сохранение значения
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing value:', error);
    }
  },

  // Получение значения
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving value:', error);
      return null;
    }
  },

  // Удаление значения
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing value:', error);
    }
  },

  // Сохранение токена авторизации
  async setAuthToken(token: string): Promise<void> {
    await this.setItem(KEYS.AUTH_TOKEN, token);
  },

  // Получение токена авторизации
  async getAuthToken(): Promise<string | null> {
    return await this.getItem(KEYS.AUTH_TOKEN);
  },

  // Сохранение токена обновления
  async setRefreshToken(token: string): Promise<void> {
    await this.setItem(KEYS.REFRESH_TOKEN, token);
  },

  // Получение токена обновления
  async getRefreshToken(): Promise<string | null> {
    return await this.getItem(KEYS.REFRESH_TOKEN);
  },

  // Сохранение ID пользователя
  async setUserId(id: string): Promise<void> {
    await this.setItem(KEYS.USER_ID, id);
  },

  // Получение ID пользователя
  async getUserId(): Promise<string | null> {
    return await this.getItem(KEYS.USER_ID);
  },

  // Удаление всех токенов (при выходе)
  async clearTokens(): Promise<void> {
    await this.removeItem(KEYS.AUTH_TOKEN);
    await this.removeItem(KEYS.REFRESH_TOKEN);
    await this.removeItem(KEYS.USER_ID);
  },
};

export { secureStorage, KEYS };
