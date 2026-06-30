import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Map, Marker, Camera } from '@maplibre/maplibre-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { t } from '../i18n/translations';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useMapState, PointFeature } from '../hooks/useMapState';
import { MapHeader } from '../components/MapHeader';
import { MapLocationButton } from '../components/MapLocationButton';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const STATUS_BAR_HEIGHT = 0; // not used directly here
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function renderMarkers(
  features: PointFeature[],
  markersRef: React.MutableRefObject<any[]>,
  selectedFarmId: string | undefined,
  onMarkerPress: (m: any) => void,
  onClusterPress: (f: PointFeature) => void,
) {
  return features.map((f) => {
    const { cluster, cluster_id, id, point_count } = f.properties;
    const [lng, lat] = f.geometry.coordinates;
    if (cluster) return (
      <Marker key={`c-${cluster_id}`} id={`c-${cluster_id}`} lngLat={[lng, lat]} anchor="center" onPress={() => onClusterPress(f)}>
        <View style={styles.clusterBubble}><Text style={styles.clusterText}>{point_count}</Text></View>
      </Marker>
    );
    const m = markersRef.current.find((x: any) => x.id === id);
    if (!m) return null;
    return (
      <Marker key={m.id} id={m.id} lngLat={[m.location.lng, m.location.lat]} anchor="center" onPress={() => onMarkerPress(m)}>
        <View style={[styles.pin, selectedFarmId === m.id && styles.pinSelected]} />
      </Marker>
    );
  });
}

export default function FarmsMapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const state = useMapState(navigation);

  const handleCategoryPress = (cat: string) => {
    if (cat === state.selectedCategory) {
      state.setShowProductFilter(!state.showProductFilter);
    } else {
      state.handleCategorySelect(cat, cat !== 'all');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <MapHeader
        selectedCategory={state.selectedCategory}
        showProductFilter={state.showProductFilter}
        products={state.products}
        productsLoading={state.productsLoading}
        selectedProductIds={state.selectedProductIds}
        filterLoading={state.filterLoading}
        onCategoryPress={handleCategoryPress}
        onToggleProduct={state.toggleProduct}
        onApplyFilter={state.applyFilter}
      />

      {state.filterLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      <Map ref={state.mapRef} style={styles.map} mapStyle={MAP_STYLE} onRegionDidChange={state.handleRegionDidChange}>
        <Camera ref={state.cameraRef} initialViewState={state.initialViewState} />
        {state.userLocation && (
          <Marker id="user-location" lngLat={[state.userLocation.lng, state.userLocation.lat]} anchor="center">
            <View style={styles.userLocationDot}><View style={styles.userLocationInner} /></View>
          </Marker>
        )}
        {renderMarkers(state.features, state.markersRef, state.selectedFarm?.id, state.handleMarkerPress, state.handleClusterPress)}
      </Map>

      {(state.selectedLoading || state.selectedFarm) && (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={state.handleCardPress}>
          {state.selectedLoading ? (
            <View style={styles.cardLoading}><ActivityIndicator size="large" color="#e53935" /></View>
          ) : (
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{state.selectedFarm!.name}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{state.selectedFarm!.address} · {state.selectedFarm!.canton}</Text>
              <View style={styles.badgeRow}>{state.selectedFarm!.types.slice(0, 3).map((type: string) => (
                <View key={type} style={styles.badge}><Text style={styles.badgeText}>{t(`type.${type}`)}</Text></View>
              ))}</View>
              <Text style={styles.cardHint}>{t('settings.tapForDetails')}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <MapLocationButton loading={state.locationLoading} onPress={state.handleMyLocation} disabled={state.locationLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', left: 16, right: 16, top: 60, height: 36,
    borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  clusterBubble: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
  clusterText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  pin: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e53935', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 8 },
  pinSelected: { backgroundColor: '#c62828', borderColor: '#ffeb3b', width: 30, height: 30, borderRadius: 15, borderWidth: 3 },
  card: { position: 'absolute', bottom: 24, left: 16, right: 16, minHeight: 100, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10, borderLeftWidth: 4, borderLeftColor: '#e53935' },
  cardLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 68 },
  cardInfo: { justifyContent: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16, color: '#222' },
  cardSubtitle: { marginTop: 3, color: '#666', fontSize: 13 },
  badgeRow: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: '#eef5ee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, color: '#2e7d32', fontWeight: '600' },
  cardHint: { marginTop: 8, fontSize: 12, color: '#e53935', fontWeight: '600', textAlign: 'right' },
  userLocationDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(25, 118, 210, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1976d2' },
  userLocationInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1976d2' },
});