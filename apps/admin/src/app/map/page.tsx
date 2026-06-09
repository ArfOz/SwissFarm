import { Farm } from '@swissfarm/types';
import FarmsMapClient from '@/components/farms/FarmsMapClient';

async function getFarms(): Promise<Farm[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3300';
  const res = await fetch(`${apiUrl}/farms`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farms: ${res.statusText}`);
  return res.json() as Promise<Farm[]>;
}

export default async function MapPage() {
  const farms = await getFarms();

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow">
          {farms.length} farm{farms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Milk Farm', color: '#3b82f6' },
          { label: 'Self-Service', color: '#f59e0b' },
          { label: 'Pick Your Own', color: '#10b981' },
          { label: 'Kids Farm', color: '#ec4899' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow text-xs font-medium text-gray-700">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[500px] bg-white rounded-lg shadow overflow-hidden">
        <FarmsMapClient farms={farms} />
      </div>
    </div>
  );
}
