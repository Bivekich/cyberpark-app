import * as SecureStore from 'expo-secure-store';
import { client } from './client';

class UsersApi {
  /**
   * Получаем presigned URL для загрузки аватара
   */
  async getAvatarUploadUrl(contentType: string = 'image/jpeg'): Promise<{ uploadUrl: string; publicUrl: string }> {
    const token = await SecureStore.getItemAsync('token');
    const response = await client.post(
      '/users/avatar/upload-url',
      { contentType },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  /**
   * Сохраняем URL аватара в профиле
   */
  async saveAvatar(avatarUrl: string): Promise<void> {
    const token = await SecureStore.getItemAsync('token');
    await client.post(
      '/users/avatar',
      { avatarUrl },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  /**
   * Получаем профиль текущего пользователя
   */
  async getCurrentUser(): Promise<any> {
    const token = await SecureStore.getItemAsync('token');
    const response = await client.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  /**
   * Получаем информацию об уровне пользователя
   */
  async getUserLevel(): Promise<{
    level: number;
    totalSpent: number;
    coinsToNextLevel: number;
    progressToNextLevel: number;
  }> {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await client.get('/users/level', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user level:', error);
      return {
        level: 1,
        totalSpent: 0,
        coinsToNextLevel: 150,
        progressToNextLevel: 0,
      };
    }
  }
}

export const usersApi = new UsersApi(); 