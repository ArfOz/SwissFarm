'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Farm, FarmType, FARM_TYPES } from '@swissfarm/types';
import { createFarm, deleteFarm, updateFarm } from '@/lib/api';
import FarmFormModal from './FarmFormModal';

const TYPE_LABELS: Record<FarmType, string> = {
  milk: 'Milk Farm',
  'self-service': 'Self-Service',
  'pick-your-own': 'Pick Your Own',
  kids: 'Kids Farm',
};

interface FarmsTableProps {
  farms: Farm[];
  selectedType?: string;
}

export default function FarmsTable({ farms: initialFarms, selectedType }: FarmsTableProps) {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; farm?: Farm } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleTypeChange = (type: string) => {
    router.push(type ? `/farms?type=${type}` : '/farms');
  };

  const handleSave = async (data: Omit<Farm, 'id'>) => {
    if (modal?.mode === 'create') {
      const created = await createFarm(data);
      setFarms((prev) => [...prev, created]);
    } else if (modal?.mode === 'edit' && modal.farm) {
      const updated = await updateFarm(modal.farm.id, data);
      setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    }
  };

  const handleDelete = async (farm: Farm) => {
    if (!confirm(`"${farm.name}" silinecek. Emin misiniz?`)) return;
    setDeletingId(farm.id);
    try {
      await deleteFarm(farm.id);
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
    } finally {
      setDeletingId(null);
    }
  };

  const displayed = selectedType
    ? farms.filter((f) => f.type === selectedType)
    : farms;

  return (
    <>
      {modal && (
        <FarmFormModal
          farm={modal.mode === 'edit' ? modal.farm : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Tür:</label>
            <select
              value={selectedType ?? ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Tümü</option>
              {FARM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
          >
            <span className="text-base leading-none">+</span> Yeni Çiftlik
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['İsim', 'Tür', 'Kanton', 'Adres', 'Ürünler', 'Çalışma Saatleri', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    Çiftlik bulunamadı.
                  </td>
                </tr>
              ) : (
                displayed.map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{farm.name}</div>
                      {farm.website && (
                        <a
                          href={farm.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline"
                        >
                          {farm.website}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {TYPE_LABELS[farm.type]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">{farm.canton}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs">{farm.address}</td>
                    <td className="px-5 py-4 text-gray-600">{farm.products.join(', ')}</td>
                    <td className="px-5 py-4 text-gray-600">{farm.openingHours ?? '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ mode: 'edit', farm })}
                          className="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(farm)}
                          disabled={deletingId === farm.id}
                          className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === farm.id ? '...' : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
