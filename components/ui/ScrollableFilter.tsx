import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface FilterOption<T> {
  label: string;
  value: T | null;
}

type ScrollableFilterProps<T> = {
  options: FilterOption<T>[];
  selectedValue: T | null;
  onSelect: (value: T | null) => void;
};

export function ScrollableFilter<T>({
  options,
  selectedValue,
  onSelect,
}: ScrollableFilterProps<T>) {
  return (
    <View style={styles.scrollableFilterContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.label}
          style={[
            styles.filterButton,
            option.value === selectedValue && styles.filterButtonActive,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.filterButtonText,
              option.value === selectedValue && styles.filterButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollableFilterContainer: {
    flexDirection: 'row',
    marginRight: -20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#272734',
  },
  filterButtonActive: {
    backgroundColor: '#00FFAA',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  filterButtonTextActive: {
    color: '#121220',
    fontWeight: '600',
  },
});
