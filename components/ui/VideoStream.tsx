import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionState } from '@/services/webrtc/WebRTCService';

interface VideoStreamProps {
  stream: MediaStream | null;
  connectionState: ConnectionState;
  onFullscreenToggle?: () => void;
  onAudioToggle?: () => void;
  isFullscreen?: boolean;
  isAudioEnabled?: boolean;
  isLoading?: boolean;
}

export function VideoStream({
  stream,
  connectionState,
  onFullscreenToggle,
  onAudioToggle,
  isFullscreen = false,
  isAudioEnabled = true,
  isLoading = false,
}: VideoStreamProps) {
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const [hasAudioTrack, setHasAudioTrack] = useState(false);

  useEffect(() => {
    if (stream) {
      // Check for video and audio tracks
      setHasVideoTrack(stream.getVideoTracks().length > 0);
      setHasAudioTrack(stream.getAudioTracks().length > 0);
      
      // In a real implementation, you would use react-native-webrtc 
      // or expo-av to display the video stream
      console.log('Video stream received with tracks:', {
        video: stream.getVideoTracks().length,
        audio: stream.getAudioTracks().length,
      });
    }
  }, [stream]);

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return '#00FFAA';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return '#FF9500';
      case ConnectionState.FAILED:
      case ConnectionState.DISCONNECTED:
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'Подключено';
      case ConnectionState.CONNECTING:
        return 'Подключение...';
      case ConnectionState.RECONNECTING:
        return 'Переподключение...';
      case ConnectionState.FAILED:
        return 'Ошибка подключения';
      case ConnectionState.DISCONNECTED:
        return 'Отключено';
      default:
        return 'Неизвестно';
    }
  };

  const renderPlaceholder = () => {
    return (
      <View style={styles.placeholder}>
        <View style={styles.placeholderContent}>
          {isLoading || connectionState === ConnectionState.CONNECTING ? (
            <>
              <ActivityIndicator size="large" color="#00FFAA" />
              <Text style={styles.placeholderText}>
                Подключение к камере...
              </Text>
            </>
          ) : connectionState === ConnectionState.FAILED ? (
            <>
              <Ionicons name="warning" size={48} color="#FF3B30" />
              <Text style={styles.placeholderText}>
                Не удалось подключиться к камере
              </Text>
              <Text style={styles.placeholderSubtext}>
                Проверьте подключение и попробуйте снова
              </Text>
            </>
          ) : connectionState === ConnectionState.CONNECTED && stream ? (
            <>
              <Ionicons name="videocam" size={48} color="#00FFAA" />
              <Text style={styles.placeholderText}>
                Видеопоток активен
              </Text>
              <Text style={styles.placeholderSubtext}>
                В реальном приложении здесь будет видео с камеры машины
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="videocam-off" size={48} color="#8E8E93" />
              <Text style={styles.placeholderText}>
                Камера недоступна
              </Text>
              <Text style={styles.placeholderSubtext}>
                Видеопоток будет отображен при подключении
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      {/* Connection Status Indicator */}
      <View style={styles.statusIndicator}>
        <View 
          style={[
            styles.statusDot, 
            { backgroundColor: getConnectionStatusColor() }
          ]} 
        />
        <Text style={styles.statusText}>
          {getConnectionStatusText()}
        </Text>
      </View>

      {/* Video Stream or Placeholder */}
      <View style={styles.videoContainer}>
        {renderPlaceholder()}
      </View>

      {/* Stream Controls */}
      <View style={styles.controls}>
        {/* Audio Toggle */}
        {hasAudioTrack && onAudioToggle && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isAudioEnabled && styles.controlButtonDisabled,
            ]}
            onPress={onAudioToggle}
          >
            <Ionicons
              name={isAudioEnabled ? 'volume-high' : 'volume-mute'}
              size={20}
              color={isAudioEnabled ? '#FFFFFF' : '#8E8E93'}
            />
          </TouchableOpacity>
        )}

        {/* Fullscreen Toggle */}
        {onFullscreenToggle && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onFullscreenToggle}
          >
            <Ionicons
              name={isFullscreen ? 'contract' : 'expand'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Stream Quality Indicator */}
      {stream && connectionState === ConnectionState.CONNECTED && (
        <View style={styles.qualityIndicator}>
          <View style={styles.qualityDots}>
            <View style={[styles.qualityDot, styles.qualityDotActive]} />
            <View style={[styles.qualityDot, styles.qualityDotActive]} />
            <View style={[styles.qualityDot, hasVideoTrack ? styles.qualityDotActive : styles.qualityDotInactive]} />
          </View>
          <Text style={styles.qualityText}>HD</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenContainer: {
    borderRadius: 0,
  },
  statusIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  placeholderContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  placeholderSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  controls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  qualityIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  qualityDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  qualityDot: {
    width: 4,
    height: 12,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  qualityDotActive: {
    backgroundColor: '#00FFAA',
  },
  qualityDotInactive: {
    backgroundColor: '#333333',
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 