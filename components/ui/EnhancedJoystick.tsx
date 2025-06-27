import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface JoystickProps {
  size?: number;
  onMove: (x: number, y: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
  showDirectionalIndicators?: boolean;
  hapticFeedback?: boolean;
  sensitivity?: number;
}

export function EnhancedJoystick({
  size = 180,
  onMove,
  onStart,
  onEnd,
  disabled = false,
  showDirectionalIndicators = true,
  hapticFeedback = true,
  sensitivity = 1,
}: JoystickProps) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const animatedPosition = useRef(new Animated.ValueXY()).current;
  const animatedScale = useRef(new Animated.Value(1)).current;
  const lastVibrationTime = useRef(0);

  const movementRadius = (size / 2) - 30;
  const thumbSize = 60;

  useEffect(() => {
    // Animate thumb position
    Animated.spring(animatedPosition, {
      toValue: position,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, [position]);

  useEffect(() => {
    // Scale animation when active
    Animated.spring(animatedScale, {
      toValue: isActive ? 1.1 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, [isActive]);

  const normalizeValue = (value: number): number => {
    return parseFloat((value / movementRadius * sensitivity).toFixed(3));
  };

  const provideFeedback = (intensity: number) => {
    if (!hapticFeedback) return;

    const now = Date.now();
    if (now - lastVibrationTime.current < 100) return; // Throttle haptics

    if (Platform.OS === 'ios') {
      if (intensity > 0.8) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (intensity > 0.5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (intensity > 0.2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // Android fallback
      if (intensity > 0.7) {
        Vibration.vibrate(50);
      }
    }

    lastVibrationTime.current = now;
  };

  const handleMove = (x: number, y: number) => {
    if (disabled) return;

    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);
    
    // Constrain movement within circle
    let constrainedX = x;
    let constrainedY = y;
    
    if (distance > movementRadius) {
      const angle = Math.atan2(y, x);
      constrainedX = movementRadius * Math.cos(angle);
      constrainedY = movementRadius * Math.sin(angle);
    }

    setPosition({ x: constrainedX, y: constrainedY });

    // Normalize values for callback (-1 to 1)
    const normalizedX = normalizeValue(constrainedX);
    const normalizedY = normalizeValue(constrainedY);
    
    onMove(normalizedX, normalizedY);

    // Provide haptic feedback based on distance from center
    const intensity = Math.min(distance / movementRadius, 1);
    if (intensity > 0.1) {
      provideFeedback(intensity);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: () => {
        if (disabled) return;
        
        setIsActive(true);
        onStart?.();
        
        if (hapticFeedback && Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        handleMove(gestureState.dx, gestureState.dy);
      },
      
      onPanResponderRelease: () => {
        if (disabled) return;
        
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
        onMove(0, 0);
        onEnd?.();
        
        if (hapticFeedback && Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    })
  ).current;

  const getDirectionOpacity = (targetX: number, targetY: number): number => {
    if (!isActive) return 0.3;
    
    const normalizedX = normalizeValue(position.x);
    const normalizedY = normalizeValue(position.y);
    
    const threshold = 0.3;
    
    if (targetX !== 0 && Math.abs(normalizedX) > threshold) {
      return (normalizedX * targetX) > 0 ? 1 : 0.3;
    }
    
    if (targetY !== 0 && Math.abs(normalizedY) > threshold) {
      return (normalizedY * targetY) > 0 ? 1 : 0.3;
    }
    
    return 0.3;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Ring */}
      <View style={[styles.outerRing, { width: size, height: size }]}>
        {/* Directional Indicators */}
        {showDirectionalIndicators && (
          <>
            {/* Up */}
            <View 
              style={[
                styles.directionIndicator,
                styles.directionUp,
                { opacity: getDirectionOpacity(0, -1) }
              ]}
            >
              <Ionicons name="chevron-up" size={16} color="#00FFAA" />
            </View>
            
            {/* Down */}
            <View 
              style={[
                styles.directionIndicator,
                styles.directionDown,
                { opacity: getDirectionOpacity(0, 1) }
              ]}
            >
              <Ionicons name="chevron-down" size={16} color="#00FFAA" />
            </View>
            
            {/* Left */}
            <View 
              style={[
                styles.directionIndicator,
                styles.directionLeft,
                { opacity: getDirectionOpacity(-1, 0) }
              ]}
            >
              <Ionicons name="chevron-back" size={16} color="#00FFAA" />
            </View>
            
            {/* Right */}
            <View 
              style={[
                styles.directionIndicator,
                styles.directionRight,
                { opacity: getDirectionOpacity(1, 0) }
              ]}
            >
              <Ionicons name="chevron-forward" size={16} color="#00FFAA" />
            </View>
          </>
        )}
        
        {/* Inner Track */}
        <View style={[styles.innerTrack, { width: size - 40, height: size - 40 }]} />
        
        {/* Center Point */}
        <View style={styles.centerPoint} />
      </View>

      {/* Joystick Thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            transform: [
              { translateX: animatedPosition.x },
              { translateY: animatedPosition.y },
              { scale: animatedScale },
            ],
          },
          disabled && styles.thumbDisabled,
          isActive && styles.thumbActive,
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.thumbInner}>
          <View style={styles.thumbGrip} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 170, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerTrack: {
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  centerPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFAA',
    opacity: 0.6,
  },
  directionIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 170, 0.2)',
    borderRadius: 12,
  },
  directionUp: {
    top: 8,
  },
  directionDown: {
    bottom: 8,
  },
  directionLeft: {
    left: 8,
  },
  directionRight: {
    right: 8,
  },
  thumb: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: '#00FFAA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FFAA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  thumbDisabled: {
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  thumbActive: {
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  thumbInner: {
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbGrip: {
    width: '50%',
    height: '50%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}); 