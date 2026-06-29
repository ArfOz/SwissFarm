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

/** GET /mobile/farms/map — lightweight map markers (optionally filtered by categoryIds) */
export async function getFarmsForMap(categoryIds?: string[]): Promise<MapMarker[]> {
  const response = await apiClient.get<MapMarker[]>('/mobile/farms/map', {
    params: {
      ...(categoryIds && categoryIds.length > 0 ? { categoryIds: categoryIds.join(',') } : {}),
    },
  });
  return response.data;
}

/**
 * GET /mobile/farms/bbox — lightweight map markers inside the given bounding box.
 */
export async function getFarmsByBBox(
  bbox: BBoxParams,
  signal?: AbortSignal,
  categoryIds?: string[],
  productIds?: string[],
): Promise<MapMarker[]> {
  const response = await apiClient.get<MapMarker[]>('/mobile/farms/bbox', {
    params: {
      southWestLat: bbox.southWestLat,
      southWestLng: bbox.southWestLng,
      northEastLat: bbox.northEastLat,
      northEastLng: bbox.northEastLng,
      ...(categoryIds && categoryIds.length > 0 ? { categoryIds: categoryIds.join(',') } : {}),
      ...(productIds && productIds.length > 0 ? { productIds: productIds.join(',') } : {}),
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

/** POST /mobile/farms/:farmId/suggestions — submit a suggestion with optional photo (base64 or URI) */
export async function submitSuggestion(
  farmId: string,
  data: { author?: string; email?: string; message: string; photo?: string },
): Promise<void> {
  await apiClient.post(`/mobile/farms/${farmId}/suggestions`, data);
}

/** GET /mobile/farms/search — case-insensitive search */
export async function searchFarms(query: string): Promise<Farm[]> {
  const q = query.trim();
  if (!q) return getFarms();
  const response = await apiClient.get<Farm[]>('/mobile/farms/search', { params: { q } });
  return response.data;
}

/** GET /mobile/farms/products/by-category/:categoryId — get products in a category */
export async function getProductsByCategory(categoryId: string): Promise<{ id: string; name: string }[]> {
  const response = await apiClient.get<{ id: string; name: string }[]>(`/mobile/farms/products/by-category/${categoryId}`);
  return response.data;
}

/** POST /mobile/farms/filter — filter by types, categoryIds, productIds */
export async function filterFarms(params: {
  types?: string[];
  categoryIds?: string[];
  productIds?: string[];
}): Promise<Farm[]> {
  const response = await apiClient.post<Farm[]>('/mobile/farms/filter', params);
  return response.data;
}

/** GET /admin/farms/products/categories — get all product categories */
export async function getCategories(): Promise<{ id: string; name: string }[]> {
  const response = await apiClient.get<{ id: string; name: string }[]>('/admin/farms/products/categories');
  return response.data;
}