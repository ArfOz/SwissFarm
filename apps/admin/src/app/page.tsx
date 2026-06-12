'use client';

import { useEffect, useState } from 'react';
import { DashboardStats, fetchDashboardStats } from '@/lib/api';

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Total Farms
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {error ? '—' : stats !== null ? stats.totalFarms : '...'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Farm Types
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {error ? '—' : stats !== null ? stats.farmTypes : '...'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Cantons
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {error ? '—' : stats !== null ? stats.cantons : '...'}
          </p>
        </div>
      </div>
    </div>
  );
}