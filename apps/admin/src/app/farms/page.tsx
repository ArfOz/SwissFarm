import { Farm } from '@swissfarm/types';
import FarmsTable from '@/components/farms/FarmsTable';

async function getFarms(type?: string): Promise<Farm[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330';
  const url = type ? `${apiUrl}/farms?type=${encodeURIComponent(type)}` : `${apiUrl}/farms`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch farms: ${res.statusText}`);
  }
  return res.json() as Promise<Farm[]>;
}

interface FarmsPageProps {
  searchParams: { type?: string };
}

export default async function FarmsPage({ searchParams }: FarmsPageProps) {
  const farms = await getFarms(searchParams.type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Farms</h1>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow">
          {farms.length} farm{farms.length !== 1 ? 's' : ''}
        </span>
      </div>
      <FarmsTable farms={farms} selectedType={searchParams.type} />
    </div>
  );
}
