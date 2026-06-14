import { Farm, FarmType, CreateFarmInput } from '@swissfarm/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330';

export interface DashboardStats {
  totalFarms: number;
  farmTypes: number;
  cantons: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [farms, types, cantons] = await Promise.all([
    fetchFarms(),
    fetch(`${API_URL}/farms/types`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${API_URL}/farms/cantons`, { cache: 'no-store' }).then((r) => r.json()),
  ]);
  return {
    totalFarms: farms.length,
    farmTypes: (types as string[]).length,
    cantons: (cantons as string[]).length,
  };
}

export async function fetchFarms(type?: FarmType): Promise<Farm[]> {
  const url = type
    ? `${API_URL}/farms?type=${encodeURIComponent(type)}`
    : `${API_URL}/farms`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farms: ${res.statusText}`);
  return res.json() as Promise<Farm[]>;
}

export async function fetchFarm(id: string): Promise<Farm> {
  const res = await fetch(`${API_URL}/farms/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farm ${id}: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}
export async function createFarm(data: CreateFarmInput): Promise<Farm> {
  const res = await fetch(`${API_URL}/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create farm: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function updateFarm(id: string, data: Partial<CreateFarmInput>): Promise<Farm> {
  const res = await fetch(`${API_URL}/farms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update farm ${id}: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function deleteFarm(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/farms/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete farm ${id}: ${res.statusText}`);
}
