import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Location } from '@/models/Location';
import { useLocation } from '@/contexts/LocationContext';

interface LocationSelectionModalProps {
  visible: boolean;
  onClose?: () => void;
  mandatory?: boolean; // If true, user cannot close without selecting
}

export function LocationSelectionModal({ 
  visible, 
  onClose, 
  mandatory = false 
}: LocationSelectionModalProps) {
  const {
    availableLocations,
    isLoadingLocations,
    setUserLocation,
    refreshLocations,
  } = useLocation();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSettingLocation, setIsSettingLocation] = useState(false);

  // Debug logging
  useEffect(() => {
    if (visible) {
      console.log('🏢 LocationSelectionModal - Modal opened with data:', {
        availableLocations: availableLocations.length,
        isLoadingLocations,
        locations: availableLocations,
      });
    }
  }, [visible, availableLocations, isLoadingLocations]);

  // Only refresh if we have no locations and we're not loading
  useEffect(() => {
    if (visible && availableLocations.length === 0 && !isLoadingLocations) {
      console.log('🏢 LocationSelectionModal - No locations available, refreshing once');
      refreshLocations();
    }
  }, [visible]);

  const handleLocationSelect = (location: Location) => {
    console.log('🏢 LocationSelectionModal - Location selected:', location);
    setSelectedLocation(location);
  };

  const handleConfirmSelection = async () => {
    if (!selectedLocation) return;

    console.log('🏢 LocationSelectionModal - Confirming selection:', selectedLocation);
    
    try {
      setIsSettingLocation(true);
      
      // FORCEFULLY CLOSE MODAL IMMEDIATELY - don't wait for setUserLocation
      setSelectedLocation(null);
      onClose?.();
      
      // Then save location in background
      await setUserLocation(selectedLocation);
      
      console.log('🏢 LocationSelectionModal - Location set and modal closed successfully');
    } catch (error) {
      console.error('🏢 LocationSelectionModal - Error setting location:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось установить локацию. Попробуйте еще раз.'
      );
    } finally {
      setIsSettingLocation(false);
    }
  };

  const handleClose = () => {
    if (!mandatory) {
      setSelectedLocation(null);
      onClose?.();
    }
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        selectedLocation?.id === item.id && styles.selectedLocationItem,
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationItemContent}>
        <Ionicons
          name="location"
          size={20}
          color={selectedLocation?.id === item.id ? '#00FFAA' : '#9F9FAC'}
        />
        <View style={styles.locationDetails}>
          <Text
            style={[
              styles.locationName,
              selectedLocation?.id === item.id && styles.selectedLocationText,
            ]}
          >
            {item.name}
          </Text>
          {item.address && (
            <Text style={styles.locationAddress}>{item.address}</Text>
          )}
          {item.description && (
            <Text style={styles.locationDescription}>{item.description}</Text>
          )}
        </View>
        {selectedLocation?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#00FFAA" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="location-outline" size={64} color="#9F9FAC" />
      <Text style={styles.emptyStateTitle}>Нет доступных локаций</Text>
      <Text style={styles.emptyStateText}>
        В данный момент нет открытых локаций для выбора
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshLocations}
        disabled={isLoadingLocations}
      >
        <Ionicons
          name="refresh"
          size={20}
          color="#00FFAA"
          style={[
            isLoadingLocations && { transform: [{ rotate: '180deg' }] },
          ]}
        />
        <Text style={styles.refreshButtonText}>Обновить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#121220', '#1A1A2E']}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="location" size={24} color="#00FFAA" />
              <Text style={styles.modalTitle}>Выберите локацию</Text>
            </View>
            {!mandatory && (
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#9F9FAC" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.modalSubtitle}>
            {mandatory
              ? 'Для использования приложения необходимо выбрать локацию'
              : 'Выберите локацию для просмотра доступных машин'}
          </Text>

          <View style={styles.locationsContainer}>
            {isLoadingLocations ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FFAA" />
                <Text style={styles.loadingText}>Загрузка локаций...</Text>
              </View>
            ) : availableLocations.length > 0 ? (
              <FlatList
                data={availableLocations}
                keyExtractor={(item) => item.id}
                renderItem={renderLocationItem}
                showsVerticalScrollIndicator={false}
                style={styles.locationsList}
              />
            ) : (
              renderEmptyState()
            )}
          </View>

          {availableLocations.length > 0 && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedLocation && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmSelection}
                disabled={!selectedLocation || isSettingLocation}
              >
                {isSettingLocation ? (
                  <ActivityIndicator size="small" color="#121220" />
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>Подтвердить выбор</Text>
                    <Ionicons name="checkmark" size={20} color="#121220" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9F9FAC',
    marginBottom: 20,
    lineHeight: 20,
  },
  locationsContainer: {
    flexGrow: 1,
    minHeight: 200,
    maxHeight: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9F9FAC',
    marginTop: 12,
    fontSize: 14,
  },
  locationsList: {
    flexGrow: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLocationItem: {
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    borderColor: '#00FFAA',
  },
  locationItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedLocationText: {
    color: '#00FFAA',
  },
  locationAddress: {
    fontSize: 14,
    color: '#9F9FAC',
    marginBottom: 2,
  },
  locationDescription: {
    fontSize: 12,
    color: '#9F9FAC',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9F9FAC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFAA',
  },
  refreshButtonText: {
    color: '#00FFAA',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#00FFAA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#3A3A4C',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121220',
    marginRight: 8,
  },
}); 