import * as SecureStore from 'expo-secure-store';

// Базовый URL API
// Используйте свой локальный IP адрес вместо localhost для тестирования на физическом устройстве
const API_URL = 'http://192.168.0.27:3000'; // Замените на IP вашего компьютера в локальной сети
// const API_URL = 'http://62.118.109.7:3000'; // URL вашего сервера
// const API_URL = 'http://10.0.2.2:3000'; // Для эмулятора Android
// const API_URL = 'http://localhost:3000'; // Для iOS симулятора

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  isAuth?: boolean;
}

/**
 * Базовый API клиент для взаимодействия с сервером
 */
export class ApiClient {
  /**
   * Выполняет API запрос
   */
  static async request<T = any>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const { method, body, isAuth = false } = options;

      // Формируем заголовки запроса
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Добавляем токен авторизации, если требуется
      if (isAuth) {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Формируем запрос
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      // Добавляем тело запроса, если есть
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Выполняем запрос
      const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
      const data = await response.json();

      // Если запрос неуспешен, выбрасываем ошибку
      if (!response.ok) {
        return { error: data.message || 'Ошибка сервера' };
      }

      return { data };
    } catch (error) {
      return { error: (error as Error).message || 'Ошибка сервера' };
    }
  }

  /**
   * Обновляет токен доступа
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await response.json();

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);

      return true;
    } catch (error) {
      await this.clearTokens();
      return false;
    }
  }

  /**
   * Очищает токены авторизации
   */
  static async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
}
