import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SettingsScreen() {
  // Настройки профиля
  const [name, setName] = useState('Иван Иванов');
  const [email, setEmail] = useState('ivan@example.com');
  const [phone, setPhone] = useState('+7 (999) 123-45-67');

  // Настройки уведомлений
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newRidesNotifications, setNewRidesNotifications] = useState(true);
  const [promotionsNotifications, setPromotionsNotifications] = useState(true);

  // Настройки смены пароля
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Другие настройки
  const [darkMode, setDarkMode] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [shareActivityData, setShareActivityData] = useState(true);

  // Активная вкладка настроек
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveProfile = () => {
    Alert.alert('Успех', 'Данные профиля успешно обновлены');
  };

  const handleChangePassword = () => {
    // Валидация паролей
    if (!currentPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }

    if (!newPassword) {
      setPasswordError('Введите новый пароль');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    // Сброс полей и отображение уведомления об успехе
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Успех', 'Пароль успешно изменен');
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Личные данные</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Имя</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ваше имя"
          placeholderTextColor="#9F9FAC"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="#9F9FAC"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Телефон</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+7 (XXX) XXX-XX-XX"
          placeholderTextColor="#9F9FAC"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSaveProfile}
      >
        <Text style={styles.primaryButtonText}>Сохранить изменения</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Изменение пароля</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Текущий пароль</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Введите текущий пароль"
          placeholderTextColor="#9F9FAC"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Новый пароль</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Введите новый пароль"
          placeholderTextColor="#9F9FAC"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Подтверждение пароля</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Подтвердите новый пароль"
          placeholderTextColor="#9F9FAC"
          secureTextEntry
        />
      </View>

      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleChangePassword}
      >
        <Text style={styles.primaryButtonText}>Изменить пароль</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Уведомления</Text>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Push-уведомления</Text>
          <Text style={styles.switchDescription}>
            Получать уведомления на устройстве
          </Text>
        </View>
        <Switch
          value={pushNotifications}
          onValueChange={setPushNotifications}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={pushNotifications ? '#00FFAA' : '#9F9FAC'}
        />
      </View>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Новые поездки</Text>
          <Text style={styles.switchDescription}>
            Уведомления о доступных машинах поблизости
          </Text>
        </View>
        <Switch
          value={newRidesNotifications}
          onValueChange={setNewRidesNotifications}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={newRidesNotifications ? '#00FFAA' : '#9F9FAC'}
        />
      </View>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Акции и скидки</Text>
          <Text style={styles.switchDescription}>
            Информация о специальных предложениях
          </Text>
        </View>
        <Switch
          value={promotionsNotifications}
          onValueChange={setPromotionsNotifications}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={promotionsNotifications ? '#00FFAA' : '#9F9FAC'}
        />
      </View>
    </View>
  );

  const renderPrivacyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Конфиденциальность</Text>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Темная тема</Text>
          <Text style={styles.switchDescription}>
            Включить темную тему приложения
          </Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={darkMode ? '#00FFAA' : '#9F9FAC'}
        />
      </View>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Местоположение</Text>
          <Text style={styles.switchDescription}>
            Доступ к данным о местоположении
          </Text>
        </View>
        <Switch
          value={shareLocation}
          onValueChange={setShareLocation}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={shareLocation ? '#00FFAA' : '#9F9FAC'}
        />
      </View>

      <View style={styles.switchOption}>
        <View style={styles.switchTextContainer}>
          <Text style={styles.switchLabel}>Статистика</Text>
          <Text style={styles.switchDescription}>
            Сбор данных об использовании для улучшения приложения
          </Text>
        </View>
        <Switch
          value={shareActivityData}
          onValueChange={setShareActivityData}
          trackColor={{ false: '#3A3A4C', true: '#00FFAA33' }}
          thumbColor={shareActivityData ? '#00FFAA' : '#9F9FAC'}
        />
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Настройки</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'profile' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('profile')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'profile' && styles.activeTabButtonText,
                  ]}
                >
                  Профиль
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'security' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('security')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'security' && styles.activeTabButtonText,
                  ]}
                >
                  Безопасность
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'notifications' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('notifications')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'notifications' && styles.activeTabButtonText,
                  ]}
                >
                  Уведомления
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'privacy' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('privacy')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'privacy' && styles.activeTabButtonText,
                  ]}
                >
                  Приватность
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsScrollContent: {
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#00FFAA',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#9F9FAC',
  },
  activeTabButtonText: {
    color: '#00FFAA',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9F9FAC',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#9F9FAC',
  },
});
