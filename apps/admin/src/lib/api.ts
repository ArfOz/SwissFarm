import { Farm, FarmType } from '@swissfarm/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330';

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
export async function createFarm(data: Omit<Farm, 'id'>): Promise<Farm> {
  const res = await fetch(`${API_URL}/farms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create farm: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export async function updateFarm(id: string, data: Partial<Omit<Farm, 'id'>>): Promise<Farm> {
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
