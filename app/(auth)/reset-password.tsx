import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen() {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    if (!email) {
      setError('Email обязателен');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Некорректный email');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (validate()) {
      await resetPassword(email);
      setIsSubmitted(true);
    }
  };

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Восстановление пароля</Text>
              <Text style={styles.subheaderText}>
                Введите ваш email для восстановления доступа
              </Text>
            </View>

            <View style={styles.formContainer}>
              {isSubmitted ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={60} color="#00FFAA" />
                  <Text style={styles.successText}>
                    Инструкции по восстановлению пароля отправлены на ваш email
                  </Text>
                  <Button
                    title="Вернуться на экран входа"
                    onPress={() => router.replace('/(auth)/signin')}
                    style={styles.backToLoginButton}
                  />
                </View>
              ) : (
                <>
                  <Input
                    label="Email"
                    placeholder="Введите ваш email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    error={error}
                  />

                  <Button
                    title="Восстановить пароль"
                    onPress={handleResetPassword}
                    isLoading={isLoading}
                    style={styles.resetButton}
                  />
                </>
              )}
            </View>
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
  keyboardAvoidView: {
    flex: 1,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subheaderText: {
    fontSize: 16,
    color: '#9F9FAC',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  resetButton: {
    marginTop: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  successText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  backToLoginButton: {
    marginTop: 20,
  },
});
