import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { MapRef, CameraRef, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import Supercluster from 'supercluster';
import throttle from 'lodash.throttle';
import * as Location from 'expo-location';
import { getFarmsByBBox, getFarmById, getFarmsForMap, getProductsByCategory, MapMarker } from '../api/farms';
import type { Farm } from '@swissfarm/types';
import { CATEGORY_NAMES, CATEGORY_LABELS, CATEGORY_IDS } from '@swissfarm/types';
import type { NativeSyntheticEvent } from 'react-native';

export interface ClusterProperties { cluster: boolean; cluster_id: number; point_count: number; point_count_abbreviated: number; id?: string; }
export interface PointFeature { type: 'Feature'; geometry: { type: 'Point'; coordinates: [number, number] }; properties: ClusterProperties; }
export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number; };

interface UseMapStateReturn {
  markers: MapMarker[];
  features: PointFeature[];
  selectedFarm: Farm | null;
  selectedLoading: boolean;
  locationLoading: boolean;
  userLocation: { lat: number; lng: number } | null;
  selectedCategory: string;
  showProductFilter: boolean;
  products: { id: string; name: string }[];
  selectedProductIds: Set<string>;
  productsLoading: boolean;
  filterLoading: boolean;
  mapRef: React.RefObject<MapRef | null>;
  cameraRef: React.RefObject<CameraRef | null>;
  markersRef: React.MutableRefObject<MapMarker[]>;
  handleRegionDidChange: (e: NativeSyntheticEvent<ViewStateChangeEvent>) => void;
  handleMarkerPress: (marker: MapMarker) => Promise<void>;
  handleClusterPress: (feature: PointFeature) => Promise<void>;
  handleMyLocation: () => Promise<void>;
  handleCardPress: () => void;
  handleCategorySelect: (cat: string, showFilter: boolean) => Promise<void>;
  setShowProductFilter: (v: boolean) => void;
  toggleProduct: (productId: string) => void;
  applyFilter: () => Promise<void>;
  initialViewState: { center: [number, number]; zoom: number };
}

export function useMapState(navigation: any): UseMapStateReturn {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [features, setFeatures] = useState<PointFeature[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductFilter, setShowProductFilter] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const superclusterRef = useRef<Supercluster | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const readyRef = useRef(false);

  useEffect(() => { markersRef.current = markers; }, [markers]);

  const getSC = useCallback(() => {
    if (!superclusterRef.current) {
      superclusterRef.current = new Supercluster({ radius: 120, minPoints: 3, maxZoom: 16, extent: 512, nodeSize: 64 });
    }
    return superclusterRef.current;
  }, []);

  useEffect(() => {
    const sc = getSC();
    if (markers.length === 0) { sc.load([]); setFeatures([]); return; }
    sc.load(markers.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.location.lng, m.location.lat] },
      properties: { cluster: false, cluster_id: 0, point_count: 0, point_count_abbreviated: 0, id: m.id },
    })));
    readyRef.current = true;
    mapRef.current?.getZoom().then((zoom) => {
      if (zoom === undefined || zoom === null) return;
      const mb = { sw: [-180, -85] as [number, number], ne: [180, 85] as [number, number] };
      setFeatures(sc.getClusters([mb.sw[0], mb.sw[1], mb.ne[0], mb.ne[1]], Math.round(zoom)) as PointFeature[]);
    }).catch(() => {});
  }, [markers, getSC]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setProducts([]);
      setSelectedProductIds(new Set());
      return;
    }
    const catId = CATEGORY_IDS[selectedCategory] || selectedCategory;
    setSelectedProductIds(new Set());
    setProductsLoading(true);
    getProductsByCategory(catId)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [selectedCategory]);

  const applyFilter = useCallback(async () => {
    setFilterLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const catIds = selectedCategory !== 'all' ? [CATEGORY_IDS[selectedCategory] || selectedCategory] : undefined;
      const prodIds = selectedProductIds.size > 0 ? Array.from(selectedProductIds) : undefined;
      const data = await getFarmsForMap(prodIds ? undefined : catIds);
      setMarkers(data);
      setShowProductFilter(false);
    } catch (e: any) {
      if (e?.name !== 'CanceledError' && e?.name !== 'AbortError') console.warn('Fetch error', e);
    } finally {
      setFilterLoading(false);
    }
  }, [selectedCategory, selectedProductIds]);

  const fetchMarkersForBounds = useCallback(async (bounds: {
    southWestLat: number; southWestLng: number; northEastLat: number; northEastLng: number;
  }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const catIds = selectedCategory !== 'all' ? [CATEGORY_IDS[selectedCategory] || selectedCategory] : undefined;
      const prodIds = selectedProductIds.size > 0 ? Array.from(selectedProductIds) : undefined;
      const data = await getFarmsByBBox(bounds, controller.signal, prodIds ? undefined : catIds, prodIds);
      setMarkers(data);
    } catch (e: any) {
      if (e?.name !== 'CanceledError' && e?.name !== 'AbortError') console.warn('Map markers fetch error', e);
    }
  }, [selectedCategory, selectedProductIds]);

  const debouncedFetchMarkers = useMemo(() =>
    throttle((region: Region) => {
      const swLat = region.latitude - region.latitudeDelta / 2;
      const neLat = region.latitude + region.latitudeDelta / 2;
      const swLng = region.longitude - region.longitudeDelta / 2;
      const neLng = region.longitude + region.longitudeDelta / 2;
      fetchMarkersForBounds({ southWestLat: swLat, southWestLng: swLng, northEastLat: neLat, northEastLng: neLng });
    }, 400), [fetchMarkersForBounds]);

  const updateClusters = useCallback((zoom: number, mb: { sw: [number, number]; ne: [number, number] }) => {
    if (!readyRef.current) return;
    const sc = getSC();
    setFeatures(sc.getClusters([mb.sw[0], mb.sw[1], mb.ne[0], mb.ne[1]], Math.round(zoom)) as PointFeature[]);
  }, [getSC]);

  const throttledHandle = useMemo(() => throttle((zoom: number, mb: { sw: [number, number]; ne: [number, number] }, region: Region) => {
    updateClusters(zoom, mb);
    debouncedFetchMarkers(region);
  }, 500), [updateClusters, debouncedFetchMarkers]);

  const handleRegionDidChange = useCallback((e: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    const { zoom, center, bounds } = e.nativeEvent;
    const mb = { sw: [bounds[0], bounds[1]] as [number, number], ne: [bounds[2], bounds[3]] as [number, number] };
    throttledHandle(zoom, mb, {
      latitude: center[1], longitude: center[0],
      latitudeDelta: bounds[3] - bounds[1], longitudeDelta: bounds[2] - bounds[0],
    });
  }, [updateClusters, debouncedFetchMarkers]);

  const handleMarkerPress = useCallback(async (marker: MapMarker) => {
    setSelectedLoading(true);
    try {
      const farm = await getFarmById(marker.id);
      setSelectedFarm(farm);
      cameraRef.current?.flyTo({ center: [marker.location.lng, marker.location.lat] as [number, number], zoom: 13, duration: 400 });
    } catch (e) { console.warn('Farm detail fetch error', e); }
    finally { setSelectedLoading(false); }
  }, []);

  const handleClusterPress = useCallback(async (feature: PointFeature) => {
    const clusterId = feature.properties.cluster_id;
    if (clusterId === undefined) return;
    const sc = getSC();
    let ez: number;
    try { ez = sc.getClusterExpansionZoom(clusterId); } catch { ez = 12; }
    const cz = await mapRef.current?.getZoom() ?? 7;
    const targetZoom = Math.min(Math.max(ez, cz + 1), 16);
    const [lng, lat] = feature.geometry.coordinates;
    cameraRef.current?.flyTo({ center: [lng, lat], zoom: targetZoom, duration: 500 });
  }, [getSC]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const handleMyLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      cameraRef.current?.flyTo({ center: [loc.coords.longitude, loc.coords.latitude] as [number, number], zoom: 13, duration: 600 });
    } catch (e) { console.warn(e); }
    finally { setLocationLoading(false); }
  }, []);

  const handleCardPress = useCallback(() => {
    if (selectedFarm) navigation.navigate('FarmDetails', { farm: selectedFarm });
  }, [selectedFarm, navigation]);

  const handleCategorySelect = useCallback(async (cat: string, showFilter: boolean) => {
    setSelectedCategory(cat);
    setSelectedProductIds(new Set());
    setShowProductFilter(showFilter);
    if (cat === 'all') {
      setFilterLoading(true);
      try {
        const data = await getFarmsForMap(undefined);
        setMarkers(data);
      } finally {
        setFilterLoading(false);
      }
    }
  }, []);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => { const n = new Set(prev); n.has(productId) ? n.delete(productId) : n.add(productId); return n; });
  };

  const initialViewState = useMemo(() => ({ center: [8.2275, 46.8182] as [number, number], zoom: 7 }), []);

  return {
    markers, features, selectedFarm, selectedLoading, locationLoading, userLocation,
    selectedCategory, showProductFilter, products, selectedProductIds, productsLoading, filterLoading,
    mapRef, cameraRef, markersRef,
    handleRegionDidChange, handleMarkerPress, handleClusterPress,
    handleMyLocation, handleCardPress, handleCategorySelect,
    setShowProductFilter, toggleProduct, applyFilter, initialViewState,
  };
}