import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/ui/SocialButton';

export default function AuthScreen() {
  const {
    user,
    isLoading,
    signInWithTelegram,
    signInWithApple,
    signInWithGoogle,
  } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(app)');
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#121220', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Text style={styles.cyberText}>CYBER</Text>
          <Text style={styles.parkText}>PARK</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.welcomeText}>Добро пожаловать</Text>
          <Text style={styles.subtitleText}>
            Войдите, чтобы арендовать управляемые кибермашинки
          </Text>

          <View style={styles.authOptionsContainer}>
            <Link href="/(auth)/signin" asChild>
              <Button title="Войти с Email" />
            </Link>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>или</Text>
              <View style={styles.line} />
            </View>

            <SocialButton
              type="telegram"
              onPress={() => signInWithTelegram()}
              style={styles.socialButton}
            />

            {Platform.OS === 'ios' && (
              <SocialButton
                type="apple"
                onPress={() => signInWithApple()}
                style={styles.socialButton}
              />
            )}

            {Platform.OS === 'android' && (
              <SocialButton
                type="google"
                onPress={() => signInWithGoogle()}
                style={styles.socialButton}
              />
            )}

            <View style={styles.signupContainer}>
              <Text style={styles.noAccountText}>Еще нет аккаунта?</Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupText}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
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
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121220',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  cyberText: {
    fontSize: 48,
    color: '#00FFAA',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  parkText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9F9FAC',
    textAlign: 'center',
    marginBottom: 40,
  },
  authOptionsContainer: {
    width: '100%',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#3D3D56',
  },
  separatorText: {
    color: '#9F9FAC',
    paddingHorizontal: 10,
  },
  socialButton: {
    marginBottom: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  noAccountText: {
    color: '#9F9FAC',
    marginRight: 5,
  },
  signupText: {
    color: '#00FFAA',
    fontWeight: '500',
  },
});
