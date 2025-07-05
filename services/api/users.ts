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
}

export const usersApi = new UsersApi(); 