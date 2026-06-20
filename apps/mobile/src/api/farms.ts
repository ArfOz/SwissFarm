import { Farm, FarmType, FarmWithDistance } from '@swissfarm/types';
import apiClient from './client';

export async function getFarms(): Promise<Farm[]> {
  const response = await apiClient.get<Farm[]>('/farms');
  return response.data;
}

export async function getFarmById(id: string): Promise<Farm> {
  const response = await apiClient.get<Farm>(`/farms/${id}`);
  return response.data;
}

/** GET /farms/types — returns all supported farm type strings */
export async function getFarmTypes(): Promise<FarmType[]> {
  const response = await apiClient.get<FarmType[]>('/farms/types');
  return response.data;
}

/** GET /farms/cantons — returns the unique cantons present in the DB */
export async function getCantons(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/farms/cantons');
  return response.data;
}

/** GET /farms/nearby?lat=&lng=&radius= — farms within `radius` km, sorted by distance */
export async function getNearbyFarms(
  lat: number,
  lng: number,
  radius = 25,
): Promise<FarmWithDistance[]> {
  const response = await apiClient.get<FarmWithDistance[]>('/farms/nearby', {
    params: { lat, lng, radius },
  });
  return response.data;
}

/** GET /farms/search?q= — case-insensitive search on name, address, canton */
export async function searchFarms(query: string): Promise<Farm[]> {
  const q = query.trim();
  if (!q) return getFarms();
  const response = await apiClient.get<Farm[]>('/farms/search', { params: { q } });
  return response.data;
}
