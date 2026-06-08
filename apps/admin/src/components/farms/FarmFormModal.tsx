'use client';

import { useState } from 'react';
import { Farm, FARM_TYPES, FarmType } from '@swissfarm/types';

const TYPE_LABELS: Record<FarmType, string> = {
  milk: 'Milk Farm',
  'self-service': 'Self-Service',
  'pick-your-own': 'Pick Your Own',
  kids: 'Kids Farm',
};

type FarmFormData = Omit<Farm, 'id'>;

interface FarmFormModalProps {
  farm?: Farm; // undefined = create, defined = edit
  onClose: () => void;
  onSave: (data: FarmFormData) => Promise<void>;
}

const empty: FarmFormData = {
  name: '',
  type: 'milk',
  products: [],
  location: { lat: 46.8182, lng: 8.2275 },
  address: '',
  canton: '',
  website: '',
  openingHours: '',
};

export default function FarmFormModal({ farm, onClose, onSave }: FarmFormModalProps) {
  const [form, setForm] = useState<FarmFormData>(
    farm ? { ...farm } : { ...empty },
  );
  const [productsInput, setProductsInput] = useState(
    farm ? farm.products.join(', ') : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FarmFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data: FarmFormData = {
        ...form,
        products: productsInput
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {farm ? 'Çiftliği Düzenle' : 'Yeni Çiftlik Ekle'}
          </h2>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Çiftlik adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tür *</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as FarmType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {FARM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kanton *</label>
              <input
                required
                value={form.canton}
                onChange={(e) => set('canton', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ZH"
                maxLength={2}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
              <input
                required
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Sokak no, Posta kodu Şehir"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enlem (lat) *</label>
              <input
                required
                type="number"
                step="any"
                value={form.location.lat}
                onChange={(e) =>
                  set('location', { ...form.location, lat: parseFloat(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="47.3769"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boylam (lng) *</label>
              <input
                required
                type="number"
                step="any"
                value={form.location.lng}
                onChange={(e) =>
                  set('location', { ...form.location, lng: parseFloat(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="8.5417"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürünler (virgülle ayır)
              </label>
              <input
                value={productsInput}
                onChange={(e) => setProductsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="süt, peynir, tereyağı"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                value={form.website ?? ''}
                onChange={(e) => set('website', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://ornekCiftlik.ch"
                type="url"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Saatleri</label>
              <input
                value={form.openingHours ?? ''}
                onChange={(e) => set('openingHours', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Pzt–Cum 08:00–18:00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : farm ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
