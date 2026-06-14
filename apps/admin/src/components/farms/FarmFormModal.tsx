'use client';

import { useState } from 'react';
import { Farm, FARM_TYPES, FarmType, OpeningHourEntry, TYPE_LABELS, DAYS, DAY_LABELS, DEFAULT_OPENING_HOURS, CANTONS, CANTON_LABELS } from '@swissfarm/types';

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
  openingHours: DEFAULT_OPENING_HOURS,
};

export default function FarmFormModal({ farm, onClose, onSave }: FarmFormModalProps) {
  const [form, setForm] = useState<FarmFormData>(
    farm ? { ...empty, ...farm, openingHours: farm.openingHours ?? DEFAULT_OPENING_HOURS } : { ...empty },
  );

  const [productsInput, setProductsInput] = useState(
    farm ? farm.products.join(', ') : '',
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FarmFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateOpeningHour = (day: string, field: 'open' | 'close', value: string) => {
    setForm((prev) => ({
      ...prev,
      openingHours: (prev.openingHours ?? DEFAULT_OPENING_HOURS).map((oh) =>
        oh.day === day ? { ...oh, [field]: value || null } : oh,
      ),
    }));
  };

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
        openingHours: (form.openingHours ?? DEFAULT_OPENING_HOURS).map((oh) => ({
          ...oh,
          open: oh.open || null,
          close: oh.close || null,
        })),
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {farm ? 'Edit Farm' : 'Add New Farm'}
          </h2>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Farm name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Canton *</label>
              <select
                required
                value={form.canton}
                onChange={(e) => set('canton', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="" disabled>Select canton</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>
                    {c} — {CANTON_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                required
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Street no, Postal code City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude (lat) *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude (lng) *</label>
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
                Products (comma-separated)
              </label>
              <input
                value={productsInput}
                onChange={(e) => setProductsInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="milk, cheese, butter"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                value={form.website ?? ''}
                onChange={(e) => set('website', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example-farm.ch"
                type="url"
              />
            </div>
          </div>

          {/* Opening Hours Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Opening Hours</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="pb-2 pr-4">Day</th>
                  <th className="pb-2 pr-4">Open</th>
                  <th className="pb-2">Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DAYS.map((day) => {
                  const oh = (form.openingHours ?? DEFAULT_OPENING_HOURS).find((h) => h.day === day);
                  return (
                    <tr key={day}>
                      <td className="py-2 pr-4 text-gray-700 font-medium">{DAY_LABELS[day]}</td>
                      <td className="py-2 pr-4">
                        <input
                          type="time"
                          value={oh?.open ?? ''}
                          onChange={(e) => updateOpeningHour(day, 'open', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="time"
                          value={oh?.close ?? ''}
                          onChange={(e) => updateOpeningHour(day, 'close', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : farm ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}