import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Farm, FarmWithDistance } from '@swissfarm/types';
import { getFarms, getNearbyFarms } from '../api/farms';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // Farms yüklendiğinde haritayı tüm marker'ları gösterecek şekilde zoomla
    if (farms.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(
          farms.map((f) => ({
            latitude: f.location.lat,
            longitude: f.location.lng,
          })),
          {
            edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
            animated: true,
          },
        );
      }, 300); // Haritanın render olması için kısa gecikme
    }
  }, [farms]);

  async function init() {
    setLoading(true);
    setError(null);

    // Önce konum izni iste
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Konum izni yoksa tüm farmları getir
      await loadAllFarms();
      setLoading(false);
      return;
    }

    // Konumu al
    const loc = await Location.getCurrentPositionAsync({});
    const lat = loc.coords.latitude;
    const lng = loc.coords.longitude;

    const inSwitzerland = lat > 45.8 && lat < 47.8 && lng > 5.9 && lng < 10.5;

    if (inSwitzerland) {
      // Yakındaki farmları backend'den getir
      await loadNearbyFarms(lat, lng);
    } else {
      // İsviçre dışındaysa tümünü göster
      await loadAllFarms();
    }

    setLoading(false);
  }

  async function loadNearbyFarms(lat: number, lng: number) {
    try {
      const data = await getNearbyFarms(lat, lng, 50);
      setFarms(data);
    } catch {
      setError('Could not load nearby farms. Please check your connection.');
    }
  }

  async function loadAllFarms() {
    try {
      const data = await getFarms();
      setFarms(data);
    } catch {
      setError('Could not load farms. Please check your connection.');
    }
  }

  const handleMarkerPress = useCallback(
    (farm: Farm) => {
      navigation.navigate('FarmDetails', { farm });
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 46.8,
          longitude: 8.2,
          latitudeDelta: 1.5,
          longitudeDelta: 1.5,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {farms.map((farm) => (
          <Marker
            key={farm.id}
            identifier={farm.id}
            coordinate={{ latitude: farm.location.lat, longitude: farm.location.lng }}
            pinColor={colors.mapMarker}
            onCalloutPress={() => handleMarkerPress(farm)}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={[typography.label, styles.calloutName]}>{farm.name}</Text>
                <Text style={[typography.caption, styles.calloutSub]}>
                  {farm.canton}
                  {'distance' in farm && farm.distance !== undefined
                    ? ` · ${(farm as FarmWithDistance).distance.toFixed(1)} km`
                    : ''}
                  {' · Tap to open'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodySmall, styles.loadingText]}>Loading farms…</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={[typography.bodySmall, styles.errorText]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: {
    padding: spacing.sm,
    minWidth: 140,
    maxWidth: 220,
  },
  calloutName: {
    color: colors.textPrimary,
    marginBottom: 2,
  },
  calloutSub: {
    color: colors.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  errorBanner: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
  },
  errorText: {
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
});