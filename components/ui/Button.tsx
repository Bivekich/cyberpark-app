import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  isFullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  isFullWidth = true,
  style,
  textStyle,
  disabled,
  ...rest
}: ButtonProps) {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles.container,
        isFullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={['#00FFAA', '#12EFEF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientContainer, isFullWidth && styles.fullWidth]}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      ) : (
        <>
          {isLoading ? (
            <ActivityIndicator
              color={variant === 'outline' ? '#00FFAA' : '#FFF'}
            />
          ) : (
            <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  gradientContainer: {
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryContainer: {
    backgroundColor: 'transparent',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
  },
  secondaryContainer: {
    backgroundColor: '#272734',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00FFAA',
  },
  outlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FFAA',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
