import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'system' | 'promo' | 'ride' | 'payment';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Имитация загрузки данных
    const loadData = async () => {
      // В реальном приложении здесь был бы API запрос
      setLoading(true);

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Скидка 20% на поездки',
          message: 'Воспользуйтесь скидкой 20% на все поездки в эти выходные!',
          date: '15 мая 2023, 14:30',
          read: false,
          type: 'promo',
        },
        {
          id: '2',
          title: 'Успешная поездка',
          message: 'Ваша поездка завершена. Стоимость: 350 ₽',
          date: '14 мая 2023, 18:45',
          read: true,
          type: 'ride',
        },
        {
          id: '3',
          title: 'Пополнение баланса',
          message: 'Ваш баланс пополнен на 1000 ₽',
          date: '10 мая 2023, 12:15',
          read: true,
          type: 'payment',
        },
        {
          id: '4',
          title: 'Обновление приложения',
          message: 'Доступна новая версия приложения с улучшенной навигацией',
          date: '5 мая 2023, 09:00',
          read: true,
          type: 'system',
        },
        {
          id: '5',
          title: 'Бонусные поездки',
          message: 'Совершите 5 поездок и получите одну бесплатно!',
          date: '1 мая 2023, 10:30',
          read: true,
          type: 'promo',
        },
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    };

    loadData();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>{item.date}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const getNotificationIcon = (type: Notification['type']) => {
    const iconSize = 24;

    switch (type) {
      case 'system':
        return (
          <Ionicons name="information-circle" size={iconSize} color="#00FFAA" />
        );
      case 'promo':
        return <Ionicons name="pricetag" size={iconSize} color="#FF9500" />;
      case 'ride':
        return <Ionicons name="car" size={iconSize} color="#5AC8FA" />;
      case 'payment':
        return <Ionicons name="wallet" size={iconSize} color="#34C759" />;
      default:
        return (
          <Ionicons name="notifications" size={iconSize} color="#00FFAA" />
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Уведомления',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#121220',
          },
          headerTitleStyle: {
            color: '#FFFFFF',
          },
        }}
      />
      <StatusBar style="light" />

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#666666" />
            <Text style={styles.emptyText}>Нет уведомлений</Text>
          </View>
        }
      />

      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.markAllReadButton}
          onPress={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
        >
          <Text style={styles.markAllReadText}>
            Отметить все как прочитанные
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121220',
  },
  backButton: {
    marginLeft: 16,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 255, 170, 0.07)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#9F9FAC',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666666',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FFAA',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9F9FAC',
    marginTop: 16,
  },
  markAllReadButton: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A3C',
  },
  markAllReadText: {
    fontSize: 16,
    color: '#00FFAA',
    fontWeight: '600',
  },
});
