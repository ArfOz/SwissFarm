import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface MapLocationButtonProps {
  loading: boolean;
  onPress: () => void;
  disabled: boolean;
}

export function MapLocationButton({ loading, onPress, disabled }: MapLocationButtonProps) {
  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onPress} disabled={disabled}>
      {loading ? <ActivityIndicator size="small" color="#1976d2" /> : <Text style={styles.icon}>🎯</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 100,
  },
  icon: { fontSize: 22 },
});