import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps extends TouchableOpacityProps {
  type: 'google' | 'apple' | 'telegram';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SocialButton({ type, style, ...rest }: SocialButtonProps) {
  const getIcon = () => {
    switch (type) {
      case 'google':
        return <Ionicons name="logo-google" size={20} color="#FFF" />;
      case 'apple':
        return <Ionicons name="logo-apple" size={20} color="#FFF" />;
      case 'telegram':
        return <Ionicons name="paper-plane" size={20} color="#FFF" />;
      default:
        return null;
    }
  };

  const getText = () => {
    switch (type) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple ID';
      case 'telegram':
        return 'Telegram';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} {...rest}>
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.text}>Войти через {getText()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#272734',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3D3D56',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 10,
  },
});
