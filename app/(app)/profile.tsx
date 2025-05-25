import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { transactionsService } from '@/services/api';
import { User } from '@/models/User';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      // Здесь должен быть вызов реального API
      // Заглушка для демонстрации
      setBalance(500);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          onPress: () => signOut(),
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToTransactions = () => {
    router.push('/profile/transactions');
  };

  const navigateToRides = () => {
    router.push('/profile/rides');
  };

  const navigateToPayments = () => {
    router.push('/profile/deposit');
  };

  const navigateToSettings = () => {
    router.push('/profile/settings');
  };

  const navigateToSupport = () => {
    router.push('/profile/support');
  };

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Мой профиль</Text>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={40} color="#FFF" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>
              {user?.fullName || 'Пользователь'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isLoading ? '...' : `${balance}`}
              </Text>
              <Text style={styles.statLabel}>Монет</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Поездок</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Уровень</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.topUpButton}
            onPress={navigateToPayments}
          >
            <Text style={styles.topUpButtonText}>Пополнить баланс</Text>
            <Ionicons name="add-circle" size={20} color="#121220" />
          </TouchableOpacity>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={navigateToRides}>
              <Ionicons name="car-sport-outline" size={24} color="#FFFFFF" />
              <Text style={styles.menuText}>История поездок</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9F9FAC"
                style={styles.menuArrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToTransactions}
            >
              <Ionicons name="cash-outline" size={24} color="#FFFFFF" />
              <Text style={styles.menuText}>История транзакций</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9F9FAC"
                style={styles.menuArrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToSettings}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
              <Text style={styles.menuText}>Настройки профиля</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9F9FAC"
                style={styles.menuArrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToSupport}
            >
              <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.menuText}>Поддержка</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9F9FAC"
                style={styles.menuArrow}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Выйти из аккаунта"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />

          <Text style={styles.versionText}>Версия 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#272734',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FFAA',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00FFAA',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121220',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#9F9FAC',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#9F9FAC',
  },
  topUpButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  topUpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
    marginRight: 8,
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  menuArrow: {
    marginLeft: 8,
  },
  signOutButton: {
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#9F9FAC',
    textAlign: 'center',
    marginBottom: 20,
  },
});
