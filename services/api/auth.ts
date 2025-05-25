import * as SecureStore from 'expo-secure-store';
import { ApiClient } from './client';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Сервис для работы с авторизацией
 */
export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const response = await ApiClient.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: { email, password, fullName },
    });

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    await this.saveTokens(response.data);
    await this.saveUserProfile({ id: '', email, fullName });

    return { success: true };
  }

  /**
   * Вход пользователя
   */
  static async signIn(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const response = await ApiClient.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: { email, password },
    });

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    await this.saveTokens(response.data);

    // Получаем профиль пользователя
    const profile = await this.getUserProfile();
    if (profile.success) {
      await this.saveUserProfile(profile.data!);
    }

    return { success: true };
  }

  /**
   * Авторизация через Telegram
   */
  static async signInWithTelegram(telegramData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    const response = await ApiClient.request<AuthResponse>('/auth/telegram', {
      method: 'POST',
      body: telegramData,
    });

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    await this.saveTokens(response.data);

    // Получаем профиль пользователя
    const profile = await this.getUserProfile();
    if (profile.success) {
      await this.saveUserProfile(profile.data!);
    }

    return { success: true };
  }

  /**
   * Авторизация через Apple
   */
  static async signInWithApple(appleData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    const response = await ApiClient.request<AuthResponse>('/auth/apple', {
      method: 'POST',
      body: appleData,
    });

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    await this.saveTokens(response.data);

    // Получаем профиль пользователя
    const profile = await this.getUserProfile();
    if (profile.success) {
      await this.saveUserProfile(profile.data!);
    }

    return { success: true };
  }

  /**
   * Выход пользователя
   */
  static async signOut(): Promise<boolean> {
    try {
      await ApiClient.request('/auth/logout', {
        method: 'POST',
        isAuth: true,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }

    // Очищаем данные пользователя и токены
    await SecureStore.deleteItemAsync('user');
    await ApiClient.clearTokens();

    return true;
  }

  /**
   * Получение профиля пользователя
   */
  static async getUserProfile(): Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
  }> {
    const response = await ApiClient.request<UserProfile>('/auth/profile', {
      method: 'GET',
      isAuth: true,
    });

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  }

  /**
   * Сохранение токенов авторизации
   */
  private static async saveTokens(tokens: AuthResponse): Promise<void> {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
  }

  /**
   * Сохранение профиля пользователя
   */
  private static async saveUserProfile(profile: UserProfile): Promise<void> {
    await SecureStore.setItemAsync('user', JSON.stringify(profile));
  }
}
