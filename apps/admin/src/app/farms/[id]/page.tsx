import { Farm } from '@swissfarm/types';
import FarmDetail from '../../../components/farms/FarmDetail';

async function getFarm(id: string): Promise<Farm> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330/api';
  const res = await fetch(`${apiUrl}/farms/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch farm: ${res.statusText}`);
  return res.json() as Promise<Farm>;
}

export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const farm = await getFarm(id);

  return (
    <div className="max-w-3xl mx-auto">
      <FarmDetail farm={farm} />
    </div>
  );
}