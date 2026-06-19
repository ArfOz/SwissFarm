'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Farm, FarmType, CreateFarmInput, FARM_TYPES } from '@swissfarm/types';
import { createFarm, deleteFarm, updateFarm } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import FarmFormModal from './FarmFormModal';

const PAGE_SIZE = 8;

interface FarmsTableProps {
  farms: Farm[];
  selectedType?: string;
}

export default function FarmsTable({ farms: initialFarms, selectedType }: FarmsTableProps) {
  const router = useRouter();
  const { t, tps } = useI18n();
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; farm?: Farm } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleTypeChange = (type: string) => {
    router.push(type ? `/farms?type=${type}` : '/farms');
  };

  const handleSave = async (data: CreateFarmInput) => {
    if (modal?.mode === 'create') {
      const created = await createFarm(data);
      setFarms((prev) => [...prev, created]);
    } else if (modal?.mode === 'edit' && modal.farm) {
      const updated = await updateFarm(modal.farm.id, data);
      setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    }
  };

  const handleDelete = async (farm: Farm) => {
    if (!confirm(t('farms.confirmDelete', { name: farm.name }))) return;
    setDeletingId(farm.id);
    try {
      await deleteFarm(farm.id);
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
    } finally {
      setDeletingId(null);
    }
  };

  const allDisplayed = useMemo(
    () =>
      selectedType
        ? farms.filter((f) => f.type === selectedType)
        : farms,
    [farms, selectedType]
  );

  const totalPages = Math.max(1, Math.ceil(allDisplayed.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFarms = allDisplayed.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const tableHeaders = [
    t('farms.name'),
    t('farms.type'),
    t('farms.canton'),
    t('farms.address'),
    'Phone',
    t('farms.products'),
    t('farms.status'),
    '',
  ];

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
            <label className="text-sm font-medium text-gray-700">{t('farms.type')}:</label>
            <select
              value={selectedType ?? ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">{t('farms.allTypes')}</option>
                {FARM_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {t(`type.${ft}`)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
          >
            <span className="text-base leading-none">+</span> {t('farms.newFarm')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((h) => (
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
              {paginatedFarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                    {t('farms.noFarms')}
                  </td>
                </tr>
              ) : (
                paginatedFarms.map((farm) => (
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
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {t(`type.${farm.type}`) || farm.type || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">{farm.canton}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs">{farm.address}</td>
                    <td className="px-5 py-4 text-gray-600">{farm.phone || '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{tps(farm.products).join(', ')}</td>
                    <td className="px-5 py-4">
                      {farm.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('farms.active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {t('farms.passive')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ mode: 'edit', farm })}
                          className="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {t('farms.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(farm)}
                          disabled={deletingId === farm.id}
                          className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === farm.id ? '...' : t('farms.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {allDisplayed.length > PAGE_SIZE && (
          <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, allDisplayed.length)} of{' '}
              {allDisplayed.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    page === safePage
                      ? 'bg-green-700 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}