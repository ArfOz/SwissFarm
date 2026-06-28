import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, Dimensions, type NativeSyntheticEvent } from 'react-native';
import * as Location from 'expo-location';
import { Map, Marker, Camera, CameraRef, MapRef, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Supercluster from 'supercluster';
import throttle from 'lodash.throttle';
import { getFarmsByBBox, getFarmById, MapMarker } from '../api/farms';
import type { Farm } from '@swissfarm/types';
import { t } from '../i18n/translations';
// TYPE_LABELS removed — all type translations use t('type.${type}') now
import type { RootStackParamList } from '../navigation/RootNavigator';

// Use a free vector tile style (avoiding CartoDB's dasharray issue)
const MAP_STYLE =
  'https://tiles.openfreemap.org/styles/liberty';

interface ClusterProperties {
  cluster: boolean;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: number;
  id?: string;
}

interface PointFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: ClusterProperties;
}

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FarmsMapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [features, setFeatures] = useState<PointFeature[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const superclusterRef = useRef<Supercluster | null>(null);

  // Lazy-init supercluster
  const getSC = useCallback(() => {
    if (!superclusterRef.current) {
      superclusterRef.current = new Supercluster({
        radius: 120,
        minPoints: 3,
        maxZoom: 16,
        extent: 512,
        nodeSize: 64,
      });
    }
    return superclusterRef.current;
  }, []);

  // Rebuild supercluster index when markers change
  useEffect(() => {
    const sc = getSC();
    if (markers.length === 0) {
      sc.load([]);
      setFeatures([]);
      return;
    }
    const geoJsonFeatures: PointFeature[] = markers.map((m) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [m.location.lng, m.location.lat],
      },
      properties: {
        cluster: false,
        cluster_id: 0,
        point_count: 0,
        point_count_abbreviated: 0,
        id: m.id,
      },
    }));
    sc.load(geoJsonFeatures);
  }, [markers, getSC]);

  const fetchMarkersForBounds = useCallback(
    async (bounds: {
      southWestLat: number;
      southWestLng: number;
      northEastLat: number;
      northEastLng: number;
    }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const data = await getFarmsByBBox(bounds, controller.signal);
        setMarkers(data);
      } catch (e: any) {
        if (e?.name !== 'CanceledError' && e?.name !== 'AbortError') {
          console.warn('Map markers fetch error', e);
        }
      }
    },
    [],
  );

  const debouncedFetchMarkers = useMemo(
    () =>
      throttle(
        (region: Region) => {
          const southWestLat = region.latitude - region.latitudeDelta / 2;
          const northEastLat = region.latitude + region.latitudeDelta / 2;
          const southWestLng = region.longitude - region.longitudeDelta / 2;
          const northEastLng = region.longitude + region.longitudeDelta / 2;

          fetchMarkersForBounds({
            southWestLat,
            southWestLng,
            northEastLat,
            northEastLng,
          });
        },
        400,
      ),
    [fetchMarkersForBounds],
  );

  const updateClusters = useCallback(
    (zoom: number, mapBounds: { sw: [number, number]; ne: [number, number] }) => {
      const sc = getSC();
      const bbox: [number, number, number, number] = [
        mapBounds.sw[0],
        mapBounds.sw[1],
        mapBounds.ne[0],
        mapBounds.ne[1],
      ];
      const clusters = sc.getClusters(bbox, Math.round(zoom)) as PointFeature[];
      setFeatures(clusters);
    },
    [getSC],
  );

  // Throttled handler that receives already-extracted plain values to avoid synthetic event pooling
  const throttledHandleChangeRef = useRef(
    throttle(
      (
        zoom: number,
        mapBounds: { sw: [number, number]; ne: [number, number] },
        region: Region,
      ) => {
        updateClusters(zoom, mapBounds);
        debouncedFetchMarkers(region);
      },
      500,
    ),
  );

  const handleRegionDidChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      // Extract nativeEvent immediately — do NOT access event inside throttled callback
      const { zoom, center, bounds } = event.nativeEvent;

      // bounds is [west, south, east, north]
      const mapBounds = {
        sw: [bounds[0], bounds[1]] as [number, number],
        ne: [bounds[2], bounds[3]] as [number, number],
      };

      // center is [lng, lat]
      const latDelta = bounds[3] - bounds[1];
      const lngDelta = bounds[2] - bounds[0];

      throttledHandleChangeRef.current(zoom, mapBounds, {
        latitude: center[1],
        longitude: center[0],
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    },
    [updateClusters, debouncedFetchMarkers],
  );

  const handleMarkerPress = useCallback(
    async (marker: MapMarker) => {
      // Don't clear selectedFarm / change pin render before API call completes,
      // otherwise the marker re-renders and the tap event is lost.
      setSelectedLoading(true);
      try {
        const farm = await getFarmById(marker.id);
        setSelectedFarm(farm);

        // Zoom in to the marker location
        cameraRef.current?.flyTo({
          center: [marker.location.lng, marker.location.lat] as [number, number],
          zoom: 13,
          duration: 400,
        });
      } catch (e) {
        console.warn('Farm detail fetch error', e);
      } finally {
        setSelectedLoading(false);
      }
    },
    [],
  );

  const handleClusterPress = useCallback(
    async (feature: PointFeature) => {
      const clusterId = feature.properties.cluster_id;
      if (clusterId === undefined) return;

      const sc = getSC();

      // Safely get expansion zoom — cluster may have been invalidated by a marker refresh
      let expansionZoom: number;
      try {
        expansionZoom = sc.getClusterExpansionZoom(clusterId);
      } catch {
        expansionZoom = 12;
      }

      // Get current zoom so we don't zoom in too aggressively
      const currentZoom = await mapRef.current?.getZoom() ?? 7;
      // Only zoom in at most 2 levels deeper than current view
      const cappedZoom = Math.min(expansionZoom, currentZoom + 2);

      cameraRef.current?.flyTo({
        center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as [number, number],
        zoom: cappedZoom,
        duration: 500,
      });
    },
    [getSC],
  );

  // Request location on mount to show user location immediately
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {
        // Silently fail
      }
    })();
  }, []);

  const handleMyLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      cameraRef.current?.flyTo({
        center: [loc.coords.longitude, loc.coords.latitude] as [number, number],
        zoom: 13,
        duration: 600,
      });
    } catch (e) {
      console.warn('Failed to get location', e);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const handleCardPress = useCallback(() => {
    if (selectedFarm) {
      navigation.navigate('FarmDetails', { farm: selectedFarm });
    }
  }, [selectedFarm, navigation]);

  const initialViewState = useMemo(
    () => ({
      center: [8.2275, 46.8182] as [number, number],
      zoom: 7,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={MAP_STYLE}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          initialViewState={initialViewState}
        />

        {userLocation && (
          <Marker
            id="user-location"
            lngLat={[userLocation.lng, userLocation.lat]}
            anchor="center"
          >
            <View style={styles.userLocationDot}>
              <View style={styles.userLocationInner} />
            </View>
          </Marker>
        )}

        {features.map((feature) => {
          const { cluster, cluster_id, id, point_count } = feature.properties;
          const [lng, lat] = feature.geometry.coordinates;

          if (cluster) {
            return (
              <Marker
                key={`cluster-${cluster_id}`}
                id={`cluster-${cluster_id}`}
                lngLat={[lng, lat]}
                anchor="center"
                onPress={() => handleClusterPress(feature)}
              >
                <View style={styles.clusterBubble}>
                  <Text style={styles.clusterText}>{point_count}</Text>
                </View>
              </Marker>
            );
          }

          const marker = markers.find((m) => m.id === id);
          if (!marker) return null;

          return (
            <Marker
              key={marker.id}
              id={marker.id}
              lngLat={[marker.location.lng, marker.location.lat]}
              anchor="center"
              onPress={() => handleMarkerPress(marker)}
            >
              <View
                style={[
                  styles.pin,
                  selectedFarm?.id === marker.id && styles.pinSelected,
                ]}
              />
            </Marker>
          );
        })}
      </Map>

      {(selectedLoading || selectedFarm) && (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={handleCardPress}
        >
          {selectedLoading ? (
            <View style={styles.cardLoading}>
              <ActivityIndicator size="large" color="#e53935" />
            </View>
          ) : (
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {selectedFarm!.name}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {selectedFarm!.address} · {selectedFarm!.canton}
              </Text>
              <View style={styles.badgeRow}>
                {selectedFarm!.types.slice(0, 3).map((type) => (
                  <View key={type} style={styles.badge}>
                    <Text style={styles.badgeText}>{t(`type.${type}`)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardHint}>{t('settings.tapForDetails')}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* My Location button */}
      <TouchableOpacity
        style={[
          styles.locationBtn,
          { bottom: Dimensions.get('window').height * 0.06 + 16 },
        ]}
        activeOpacity={0.8}
        onPress={handleMyLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color="#1976d2" />
        ) : (
          <Text style={styles.locationIcon}>🎯</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  clusterBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  clusterText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e53935',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  pinSelected: {
    backgroundColor: '#c62828',
    borderColor: '#ffeb3b',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
  },

  card: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e53935',
  },
  cardLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 68,
  },
  cardInfo: { justifyContent: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16, color: '#222' },
  cardSubtitle: { marginTop: 3, color: '#666', fontSize: 13 },
  badgeRow: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', gap: 6 },
  badge: {
    backgroundColor: '#eef5ee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
  cardHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#e53935',
    fontWeight: '600',
    textAlign: 'right',
  },

  locationBtn: {
    position: 'absolute',
    right: 16,
    bottom: Dimensions.get('window').height * 0.08,
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
  locationIconInner: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCrosshair: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1976d2',
    position: 'absolute',
    top: 7,
    left: 7,
  },
  locationIcon: {
    fontSize: 22,
  },

  userLocationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  userLocationInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976d2',
  },
});
