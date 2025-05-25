import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { secureStorage } from '../../services/secureStorage';
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '../../constants/api';

// Интерфейс для ошибок от сервера
export interface ApiError {
  message: string;
  statusCode: number;
  data?: any;
}

// Интерфейс для ответа с ошибкой от сервера
interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Перехватчик запросов для добавления токена
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await secureStorage.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Перехватчик ответов для обработки ошибок и обновления токена
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Обработка истекшего токена
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Получаем refresh токен
            const refreshToken = await secureStorage.getRefreshToken();
            if (!refreshToken) {
              // Если нет refresh токена, выходим из системы
              await secureStorage.clearTokens();
              return Promise.reject(error);
            }

            // Запрос на обновление токена
            const response = await axios.post(
              `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

            // Сохраняем новые токены
            await secureStorage.setAuthToken(accessToken);
            await secureStorage.setRefreshToken(newRefreshToken);

            // Обрабатываем очередь неудачных запросов
            this.processQueue(null, accessToken);

            // Повторяем оригинальный запрос с новым токеном
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Обрабатываем ошибку обновления токена
            this.processQueue(refreshError, null);
            await secureStorage.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Форматируем ошибку API
        if (error.response?.data) {
          const errorData = error.response.data as ApiErrorResponse;
          return Promise.reject({
            message: errorData.message || 'Произошла ошибка',
            statusCode: error.response.status,
            data: error.response.data,
          } as ApiError);
        }

        // Обработка сетевых ошибок
        if (error.message === 'Network Error') {
          return Promise.reject({
            message: 'Ошибка сети. Проверьте подключение к интернету',
            statusCode: 0,
          } as ApiError);
        }

        // Обработка таймаута
        if (error.code === 'ECONNABORTED') {
          return Promise.reject({
            message: 'Время ожидания истекло. Попробуйте позже',
            statusCode: 0,
          } as ApiError);
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((request) => {
      if (error) {
        request.reject(error);
      } else {
        request.originalRequest.headers.Authorization = `Bearer ${token}`;
        request.resolve(this.instance(request.originalRequest));
      }
    });
    this.failedQueue = [];
  }

  // GET запрос
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  // POST запрос
  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(
      url,
      data,
      config
    );
    return response.data;
  }

  // PUT запрос
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(
      url,
      data,
      config
    );
    return response.data;
  }

  // PATCH запрос
  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  // DELETE запрос
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }
}

// Экспортируем экземпляр класса для использования в приложении
export const apiClient = new ApiClient();
