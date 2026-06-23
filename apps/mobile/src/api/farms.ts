import { Farm, FarmType, FarmWithDistance, FarmLocation } from '@swissfarm/types';
import apiClient from './client';

/** Lightweight map markers — only id, name, location, canton, types */
export interface MapMarker {
  id: string;
  name: string;
  location: FarmLocation;
  canton: string;
  types: string[];
}

/** Bounding box query parameters for viewport-based loading */
export interface BBoxParams {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
}

/** GET /mobile/farms/map — lightweight map markers */
export async function getFarmsForMap(): Promise<MapMarker[]> {
  const response = await apiClient.get<MapMarker[]>('/mobile/farms/map');
  return response.data;
}

/**
 * GET /mobile/farms/bbox — lightweight map markers inside the given bounding box.
 * This is the viewport-based lazy loading endpoint.
 */
export async function getFarmsByBBox(bbox: BBoxParams, signal?: AbortSignal): Promise<MapMarker[]> {
  const response = await apiClient.get<MapMarker[]>('/mobile/farms/bbox', {
    params: {
      southWestLat: bbox.southWestLat,
      southWestLng: bbox.southWestLng,
      northEastLat: bbox.northEastLat,
      northEastLng: bbox.northEastLng,
    },
    signal,
  });
  return response.data;
}

/** GET /mobile/farms — all farms (detailed) */
export async function getFarms(): Promise<Farm[]> {
  const response = await apiClient.get<Farm[]>('/mobile/farms');
  return response.data;
}

/** GET /mobile/farms/:id — single farm details */
export async function getFarmById(id: string): Promise<Farm> {
  const response = await apiClient.get<Farm>(`/mobile/farms/${id}`);
  return response.data;
}

/** GET /mobile/farms/types — all farm type strings */
export async function getFarmTypes(): Promise<FarmType[]> {
  const response = await apiClient.get<FarmType[]>('/mobile/farms/types');
  return response.data;
}

/** GET /mobile/farms/cantons — unique canton list */
export async function getCantons(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/mobile/farms/cantons');
  return response.data;
}

/** GET /mobile/farms/nearby — farms within radius km */
export async function getNearbyFarms(
  lat: number,
  lng: number,
  radius = 25,
): Promise<FarmWithDistance[]> {
  const response = await apiClient.get<FarmWithDistance[]>('/mobile/farms/nearby', {
    params: { lat, lng, radius },
  });
  return response.data;
}

/** GET /mobile/farms/search — case-insensitive search */
export async function searchFarms(query: string): Promise<Farm[]> {
  const q = query.trim();
  if (!q) return getFarms();
  const response = await apiClient.get<Farm[]>('/mobile/farms/search', { params: { q } });
  return response.data;
}