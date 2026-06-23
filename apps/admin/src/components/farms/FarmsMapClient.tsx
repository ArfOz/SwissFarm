'use client';

import dynamic from 'next/dynamic';
import { Farm } from '@swissfarm/types';

const FarmsMap = dynamic(() => import('./FarmsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <p className="text-gray-500 text-sm">Map loading...</p>
    </div>
  ),
});

interface FarmsMapClientProps {
  farms: Farm[];
}

export default function FarmsMapClient({ farms }: FarmsMapClientProps) {
  return <FarmsMap farms={farms} />;
}
