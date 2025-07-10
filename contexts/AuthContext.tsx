import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { AuthService } from '@/services/api/auth';
import { client } from '@/services/api/client';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Location } from '@/models/Location';

interface User {
  id: string;
  email?: string;
  fullName?: string;
  profileImage?: string;
  selectedLocationId?: string;
  selectedLocation?: Location;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithTelegram: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  async function loadUserFromStorage() {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        // Try to fetch fresh user data from API
        try {
          const response = await client.get('/auth/profile');
          if (response.data) {
            console.log('Fresh user data from API:', response.data);
            setUser(response.data);
            await SecureStore.setItemAsync('user', JSON.stringify(response.data));
            console.log('User data stored in SecureStore');
            return;
          }
        } catch (apiError) {
          // Silently fall back to stored user data if API call fails
          // This is normal when token is expired or network is unavailable
          console.log('Using stored user data, API call failed');
        }
      }
      
      // Fallback to stored user data
      const userJson = await SecureStore.getItemAsync('user');
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        console.log('Loaded stored user data:', storedUser);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);

      const result = await AuthService.signIn(email, password);

      if (result.success) {
        await loadUserFromStorage();
        router.replace('/(app)');
      } else {
        Alert.alert(
          'Ошибка входа',
          result.error || 'Неверный email или пароль'
        );
      }
    } catch (error) {
      Alert.alert('Ошибка входа', 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      setIsLoading(true);

      const result = await AuthService.signUp(email, password, fullName);

      if (result.success) {
        await loadUserFromStorage();
        router.replace('/(app)');
      } else {
        Alert.alert(
          'Ошибка регистрации',
          result.error || 'Не удалось зарегистрировать пользователя'
        );
      }
    } catch (error) {
      Alert.alert(
        'Ошибка регистрации',
        'Не удалось зарегистрировать пользователя'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      await AuthService.signOut();
      setUser(null);
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function resetPassword(email: string) {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call to backend

      Alert.alert(
        'Восстановление пароля',
        'Инструкции по восстановлению пароля отправлены на ваш email'
      );
    } catch (error) {
      Alert.alert(
        'Ошибка',
        'Не удалось отправить инструкции по восстановлению пароля'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setIsLoading(true);
      // TODO: Implement Google authentication
      Alert.alert(
        'В разработке',
        'Авторизация через Google в настоящее время разрабатывается'
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить вход через Google');
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithApple() {
    try {
      setIsLoading(true);

      // Получаем учетные данные из Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Авторизуемся с полученными данными
      const result = await AuthService.signInWithApple({
        idToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        fullName: credential.fullName,
        email: credential.email,
      });

      if (result.success) {
        await loadUserFromStorage();
        router.replace('/(app)');
      } else {
        Alert.alert(
          'Ошибка входа',
          result.error || 'Не удалось выполнить вход через Apple ID'
        );
      }
    } catch (error: any) {
      // Не показываем ошибку при отмене авторизации
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Ошибка', 'Не удалось выполнить вход через Apple ID');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithTelegram() {
    try {
      setIsLoading(true);

      // Формируем URL для авторизации через Telegram
      const botName = process.env.TELEGRAM_BOT_NAME || 'YourBotName';
      const redirectUrl = encodeURIComponent('https://your-app-redirect.com');
      const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${redirectUrl}&return_to=${redirectUrl}`;

      // Открываем браузер для авторизации
      const result = await WebBrowser.openAuthSessionAsync(
        telegramAuthUrl,
        'cyberpark://auth/telegram'
      );

      if (result.type === 'success' && result.url) {
        // Разбор URL и получение данных пользователя
        const url = new URL(result.url);
        const telegramData = {
          id: url.searchParams.get('id'),
          first_name: url.searchParams.get('first_name'),
          last_name: url.searchParams.get('last_name'),
          username: url.searchParams.get('username'),
          photo_url: url.searchParams.get('photo_url'),
          auth_date: Number(url.searchParams.get('auth_date')),
          hash: url.searchParams.get('hash'),
        };

        // Авторизуемся с полученными данными
        const authResult = await AuthService.signInWithTelegram(telegramData);

        if (authResult.success) {
          await loadUserFromStorage();
          router.replace('/(app)');
        } else {
          Alert.alert(
            'Ошибка входа',
            authResult.error || 'Не удалось выполнить вход через Telegram'
          );
        }
      } else {
        // Пользователь отменил авторизацию
        console.log('User cancelled Telegram auth');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить вход через Telegram');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser() {
    try {
      // Try to get fresh user data from API with automatic auth handling
      const response = await client.get('/auth/profile');
      if (response.data) {
        console.log('Fresh user data from updateUser:', response.data);
        setUser(response.data);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.log('Failed to refresh user data in updateUser, falling back to stored data');
      // Fall back to loading from storage
      await loadUserFromStorage();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        signInWithApple,
        signInWithTelegram,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
