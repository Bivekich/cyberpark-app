import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00FFAA',
        tabBarInactiveTintColor: '#9F9FAC',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopWidth: 1,
          borderTopColor: '#272734',
          height: 60,
        },
        tabBarLabelStyle: {
          marginBottom: 5,
        },
        headerStyle: {
          backgroundColor: '#1A1A2E',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Машины',
          tabBarIcon: ({ color }) => (
            <Ionicons name="car-sport-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: 'Управление',
          tabBarIcon: ({ color }) => (
            <Ionicons name="game-controller-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/deposit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/rides"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/transactions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/support"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/privacy-policy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/terms-of-service"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/ride-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="catalog/details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
