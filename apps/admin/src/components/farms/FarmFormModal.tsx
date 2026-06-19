'use client';

import { useState, useEffect } from 'react';
import { Farm, PaymentMethod, ProductInfo, CreateFarmInput, FARM_TYPES, FarmType, DAYS, DEFAULT_OPENING_HOURS, CANTONS, CANTON_LABELS, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@swissfarm/types';
import { fetchProducts } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface FarmFormModalProps {
  farm?: Farm; // undefined = create, defined = edit
  onClose: () => void;
  onSave: (data: CreateFarmInput) => Promise<void>;
}

const empty: CreateFarmInput = {
  name: '',
  type: 'milk',
  products: [],
  location: { lat: 46.8182, lng: 8.2275 },
  address: '',
  canton: '',
  phone: '',
  website: '',
  isActive: true,
  paymentMethods: [],
  openingHours: DEFAULT_OPENING_HOURS,
};

function farmToForm(farm: Farm): CreateFarmInput {
  return {
    name: farm.name,
    type: farm.type,
    products: farm.products.map((p) => p.name),
    location: { ...farm.location },
    address: farm.address,
    canton: farm.canton,
    phone: farm.phone ?? '',
    website: farm.website ?? '',
    isActive: farm.isActive,
    paymentMethods: farm.paymentMethods,
    openingHours: farm.openingHours ?? DEFAULT_OPENING_HOURS,
  };
}

export default function FarmFormModal({ farm, onClose, onSave }: FarmFormModalProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<CreateFarmInput>(
    farm ? farmToForm(farm) : { ...empty },
  );
  const [allProducts, setAllProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setAllProducts)
      .catch(() => {}) // silently fail, fallback to text input
      .finally(() => setLoadingProducts(false));
  }, []);

  const set = (key: keyof CreateFarmInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const togglePaymentMethod = (method: PaymentMethod) => {
    setForm((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const toggleProduct = (productName: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(productName)
        ? prev.products.filter((p) => p !== productName)
        : [...prev.products, productName],
    }));
  };

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
      const data: CreateFarmInput = {
        ...form,
        openingHours: (form.openingHours ?? DEFAULT_OPENING_HOURS).map((oh) => ({
          ...oh,
          open: oh.open || null,
          close: oh.close || null,
        })),
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {farm ? t('farms.editFarm') : t('farms.addFarm')}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.name')}</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('farms.form.placeholder.name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.type')}</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as FarmType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {FARM_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {t(`type.${ft}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.canton')}</label>
              <select
                required
                value={form.canton}
                onChange={(e) => set('canton', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="" disabled>{t('farms.form.selectCanton')}</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>
                    {c} — {CANTON_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.address')}</label>
              <input
                required
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('farms.form.placeholder.address')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.latitude')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.longitude')}</label>
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
                {t('farms.form.products')}
              </label>
              {loadingProducts ? (
                <div className="text-sm text-gray-400 py-2">{t('common.loading') ?? 'Loading...'}</div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-2 max-h-40 overflow-y-auto">
                  {allProducts.length === 0 ? (
                    <input
                      value={form.products.join(', ')}
                      onChange={(e) => set('products', e.target.value.split(',').map((p) => p.trim()).filter(Boolean))}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('farms.form.placeholder.products')}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {allProducts.map((product) => {
                        const isSelected = form.products.includes(product.name);
                        return (
                          <label
                            key={product.id}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                              isSelected
                                ? 'bg-green-100 text-green-800'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProduct(product.name)}
                              className="rounded border-gray-300 text-green-700 focus:ring-green-500"
                            />
                            {product.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Methods</label>
              <div className="border border-gray-300 rounded-lg p-2">
                <div className="grid grid-cols-2 gap-1">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = form.paymentMethods.includes(method);
                    return (
                      <label
                        key={method}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${
                          isSelected
                            ? 'bg-green-100 text-green-800'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePaymentMethod(method)}
                          className="rounded border-gray-300 text-green-700 focus:ring-green-500"
                        />
                        {PAYMENT_METHOD_LABELS[method]}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone ?? ''}
                onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+41 00 000 00 00"
                type="tel"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('farms.form.website')}</label>
              <input
                value={form.website ?? ''}
                onChange={(e) => set('website', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('farms.form.placeholder.website')}
                type="url"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-green-700 focus:ring-green-500"
                />
                {t('farms.form.active')}
              </label>
            </div>
          </div>

          {/* Opening Hours Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">{t('farms.form.openingHours')}</h3>
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
                  const oh = (form.openingHours ?? DEFAULT_OPENING_HOURS).find((h) => h.day === day);
                  return (
                    <tr key={day}>
                      <td className="py-2 pr-4 text-gray-700 font-medium">{t(`day.${day}`)}</td>
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
              {t('farms.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? t('farms.saving') : farm ? t('farms.save') : t('farms.addFarm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}