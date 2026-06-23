import React, { useRef, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Region, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Farm } from '@swissfarm/types';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useMapFarms } from '../hooks/useMapFarms';
import { getFarmById } from '../api/farms';
import { Cluster } from '../utils/clustering';
import ClusterMarker from '../components/ClusterMarker';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

const INITIAL = { latitude: 46.948, longitude: 7.4474, latitudeDelta: 0.15, longitudeDelta: 0.15 };

interface AirbnbPinProps {
  lat: number;
  lng: number;
  name?: string;
  canton?: string;
  onPress?: () => void;
}

interface FarmPinProps {
  cluster: Cluster;
  onPress: (c: Cluster) => void;
}

// Airbnb-style red marker — teardrop/bubble pin shape like Airbnb
const AirbnbPin = React.memo(
  ({
    lat,
    lng,
    name,
    onPress,
  }: AirbnbPinProps) => (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.airbnbPin}>
        <View style={styles.airbnbPinInner} />
      </View>
      {name && (
        <View style={styles.airbnbLabel}>
          <Text style={styles.airbnbLabelText} numberOfLines={1}>
            CHF
          </Text>
        </View>
      )}
    </Marker>
  ),
  (a: AirbnbPinProps, b: AirbnbPinProps) => a.lat === b.lat && a.lng === b.lng && a.name === b.name,
);

// Single farm pin wrapper that also navigates on press
const FarmPin = React.memo(
  ({
    cluster,
    onPress,
  }: FarmPinProps) => (
    <AirbnbPin
      lat={cluster.latitude}
      lng={cluster.longitude}
      name={cluster.sampleName}
      canton={cluster.sampleCanton}
      onPress={() => onPress(cluster)}
    />
  ),
  (a: FarmPinProps, b: FarmPinProps) =>
    a.cluster.id === b.cluster.id &&
    a.cluster.latitude === b.cluster.latitude &&
    a.cluster.longitude === b.cluster.longitude,
);

export default function MapScreen() {
  const nav = useNavigation<NavProp>();
  const { clusters, zoomLevel, loading, error, onRegionChangeComplete } = useMapFarms();
  const mapRef = useRef<MapView>(null);
  const initRef = useRef(false);

  const handleClusterPress = useCallback(
    (cluster: Cluster) => {
      if (cluster.count > 1) {
        const pad = 0.02;
        const newRegion: Region = {
          latitude: cluster.latitude,
          longitude: cluster.longitude,
          latitudeDelta: pad,
          longitudeDelta: pad,
        };
        mapRef.current?.animateToRegion(newRegion, 300);
        onRegionChangeComplete(newRegion);
      } else if (cluster.markerIds.length > 0) {
        nav.navigate('FarmDetails', {
          farmId: cluster.markerIds[0],
        });
      }
    },
    [nav, onRegionChangeComplete],
  );

  const handleReady = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;
    onRegionChangeComplete(INITIAL);
  }, [onRegionChangeComplete]);

  const showIndividualPins = zoomLevel >= 13;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL}
        onLayout={handleReady}
        onMapReady={() => onRegionChangeComplete(INITIAL)}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Clusters shown at all zoom levels < 13 */}
        {!showIndividualPins &&
          clusters.map((c) => <ClusterMarker key={c.id} cluster={c} onPress={handleClusterPress} />)}

        {/* Individual pins only at zoom >= 13 — all farms shown individually */}
        {showIndividualPins &&
          clusters
            .filter((c) => c.count === 1)
            .map((c) => <FarmPin key={c.id} cluster={c} onPress={handleClusterPress} />)}
      </MapView>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.error}>
          <Text style={[typography.bodySmall, { color: '#fff' }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  error: { position: 'absolute', bottom: spacing.lg, left: spacing.md, right: spacing.md, backgroundColor: colors.error, borderRadius: 8, padding: spacing.md },

  // Airbnb-style teardrop pin
  airbnbPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF385C', // Airbnb red
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  airbnbPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  // Price label bubble above the pin (like Airbnb shows price)
  airbnbLabel: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  airbnbLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF385C',
  },
});
