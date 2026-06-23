import { useCallback, useState } from 'react';
import { Region } from 'react-native-maps';
import { getFarmsByBBox } from '../api/farms';
import { clusterMarkers, Cluster } from '../utils/clustering';

export function useMapFarms() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBBox = async (region: Region, zoom: number) => {
    try {
      setLoading(true);
      setError(null);

      const swLat = region.latitude - region.latitudeDelta / 2;
      const neLat = region.latitude + region.latitudeDelta / 2;
      const swLng = region.longitude - region.longitudeDelta / 2;
      const neLng = region.longitude + region.longitudeDelta / 2;

      const farms = await getFarmsByBBox({
        southWestLat: swLat,
        southWestLng: swLng,
        northEastLat: neLat,
        northEastLng: neLng,
      });

      const points = farms.map((f) => ({
        id: f.id,
        latitude: f.location.lat,
        longitude: f.location.lng,
        name: f.name,
        canton: f.canton,
      }));

      const newClusters = clusterMarkers(points, zoom);
      setClusters(newClusters);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const onRegionChangeComplete = useCallback((region: Region) => {
    const zoom = Math.round(Math.log2(360 / region.latitudeDelta));
    setZoomLevel(zoom);
    fetchBBox(region, zoom);
  }, []);

  return {
    clusters,
    zoomLevel,
    loading,
    error,
    onRegionChangeComplete,
  };
}
