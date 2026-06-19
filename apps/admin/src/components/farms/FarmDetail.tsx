'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Farm, DAYS, CreateFarmInput } from '@swissfarm/types';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { updateFarm } from '@/lib/api';
import FarmFormModal from './FarmFormModal';

// Dynamically import Map to avoid SSR issues with Leaflet
const FarmsMap = dynamic(() => import('@/components/farms/FarmsMap'), { ssr: false });

interface FarmDetailProps {
  farm: Farm;
}

export default function FarmDetail({ farm: initialFarm }: FarmDetailProps) {
  const router = useRouter();
  const { t, tps, tp } = useI18n();
  const [farm, setFarm] = useState<Farm>(initialFarm);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditSave = async (data: CreateFarmInput) => {
    const updated = await updateFarm(farm.id, data);
    setFarm(updated);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Edit modal */}
      {showEditModal && (
        <FarmFormModal
          farm={farm}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => router.push('/farms')}
        className="text-sm text-green-700 hover:text-green-800 flex items-center gap-1"
      >
        ← {t('farms.backToList') || 'Back to Farms'}
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
            <span className="text-sm text-gray-500">{t(`type.${farm.type}`) || farm.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                farm.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {farm.isActive ? t('farms.active') : t('farms.passive')}
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('farms.details') || 'Farm Details'}</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">{t('farms.address')}</label>
              <p className="text-sm text-gray-900 mt-0.5">{farm.address}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">{t('farms.canton')}</label>
              <p className="text-sm text-gray-900 mt-0.5">{farm.canton}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase">Coordinates</label>
              <p className="text-sm text-gray-900 mt-0.5">
                {farm.location.lat.toFixed(4)}, {farm.location.lng.toFixed(4)}
              </p>
            </div>

            {farm.phone && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Phone</label>
                <p className="text-sm text-gray-900 mt-0.5">{farm.phone}</p>
              </div>
            )}

            {farm.website && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">{t('farms.form.website')}</label>
                <a
                  href={farm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline mt-0.5 block"
                >
                  {farm.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Products */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('farms.products')}</h2>

          {farm.products.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {farm.products.map((product) => (
                <span
                  key={product.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {tp(product.name)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t('farms.noProducts') || 'No products'}</p>
          )}
        </div>
      </div>

      {/* Opening Hours */}
      {farm.openingHours && farm.openingHours.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('farms.form.openingHours')}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-2 pr-4">{t('farms.form.day')}</th>
                <th className="pb-2 pr-4">{t('farms.form.open')}</th>
                <th className="pb-2">{t('farms.form.close')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DAYS.map((day) => {
                const oh = farm.openingHours!.find((h) => h.day === day);
                return (
                  <tr key={day}>
                    <td className="py-2 pr-4 text-gray-700 font-medium">{t(`day.${day}`)}</td>
                    <td className="py-2 pr-4 text-gray-600">{oh?.open ?? '—'}</td>
                    <td className="py-2 text-gray-600">{oh?.close ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mini Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '300px' }}>
        <FarmsMap farms={[farm]} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
        >
          {t('farms.edit')}
        </button>
      </div>
    </div>
  );
}