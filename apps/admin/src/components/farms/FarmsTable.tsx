'use client';

import { useState, useEffect, useMemo } from 'react';
import { Farm, FarmType, CreateFarmInput, FARM_TYPES } from '@swissfarm/types';
import { createFarm, deleteFarm, updateFarm } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import FarmFormModal from './FarmFormModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330/api';

const PAGE_SIZE = 8;

interface FarmsTableProps {
  farms: Farm[];
  selectedType?: string;
}

export default function FarmsTable({ farms: initialFarms, selectedType: initialType }: FarmsTableProps) {
  const { t, tps } = useI18n();
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [localType, setLocalType] = useState(initialType ?? '');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; farm?: Farm } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrokenLocation, setShowBrokenLocation] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch filtered farms from backend on filter change
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/farms/filter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            types: localType ? [localType as FarmType] : undefined,
            brokenLocation: showBrokenLocation || undefined,
            productNames: productFilter.trim() ? productFilter.trim().split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
  }, [localType, showBrokenLocation, productFilter]);

  const handleTypeChange = (type: string) => {
    setLocalType(type);
    setCurrentPage(1);
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
    () => {
      let filtered = farms;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter((f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.canton.toLowerCase().includes(q)
        );
      }

      return filtered;
    },
    [farms, searchQuery]
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
              value={localType}
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

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBrokenLocation}
                onChange={(e) => { setShowBrokenLocation(e.target.checked); setCurrentPage(1); }}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-xs text-red-600 font-medium">Broken Location</span>
            </label>

            <input
              type="text"
              value={productFilter}
              onChange={(e) => { setProductFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by product..."
              className="w-40 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, address or canton..."
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
                      {farm.types.map((ft) => t(`type.${ft}`)).join(', ') || '—'}
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