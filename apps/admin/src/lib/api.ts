import { Farm, FarmType, CreateFarmInput } from '@swissfarm/types';
import { isTokenExpired } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330/api';

/**
 * Redirect to login page and clear auth data.
 */
function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  window.location.href = '/auth/login';
}

/**
 * Check if the stored token is expired before making a request.
 */
function checkTokenBeforeRequest(): void {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (isTokenExpired(token)) {
    redirectToLogin();
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Enhanced fetch wrapper that:
 *   - Checks token expiry before the request
 *   - Redirects to login on 401 responses
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  checkTokenBeforeRequest();

  const res = await fetch(url, options);

  if (res.status === 401) {
    redirectToLogin();
    throw new Error('Unauthorized – redirecting to login');
  }

  return res;
}

export interface DashboardStats {
  totalFarms: number;
  farmTypes: number;
  cantons: number;
}

export async function fetchProducts(): Promise<{ id: string; name: string }[]> {
  const res = await authFetch(`${API_URL}/farms/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  return res.json() as Promise<{ id: string; name: string }[]>;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [farms, types, cantons] = await Promise.all([
    fetchFarms(),
    authFetch(`${API_URL}/farms/types`, { cache: 'no-store' }).then((r) => r.json()),
    authFetch(`${API_URL}/farms/cantons`, { cache: 'no-store' }).then((r) => r.json()),
  ]);
  return {
    totalFarms: farms.length,
    farmTypes: (types as string[]).length,
    cantons: (cantons as string[]).length,
  };
}

export async function fetchFarms(types?: FarmType[]): Promise<Farm[]> {
  const url = types && types.length > 0
    ? `${API_URL}/farms?types=${types.map(encodeURIComponent).join(',')}`
    : `${API_URL}/farms`;
  const res = await authFetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farms: ${res.statusText}`);
  return res.json() as Promise<Farm[]>;
}

export async function fetchFarm(id: string): Promise<Farm> {
  const res = await authFetch(`${API_URL}/farms/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farm ${id}: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function createFarm(data: CreateFarmInput): Promise<Farm> {
  const res = await authFetch(`${API_URL}/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create farm: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function updateFarm(id: string, data: Partial<CreateFarmInput>): Promise<Farm> {
  const res = await authFetch(`${API_URL}/farms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update farm ${id}: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function deleteFarm(id: string): Promise<void> {
  const res = await authFetch(`${API_URL}/farms/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error(`Failed to delete farm ${id}: ${res.statusText}`);
}