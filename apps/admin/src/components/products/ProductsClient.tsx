'use client';

import { useState, useEffect } from 'react';
import { fetchAllProducts, fetchProductCategories, updateProductCategory } from '@/lib/api';
import { CATEGORY_LABELS } from '@swissfarm/types';

interface Product {
  id: string;
  name: string;
  category?: string;
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [allProducts, allCategories] = await Promise.all([
          fetchAllProducts(),
          fetchProductCategories(),
        ]);
        setProducts(allProducts);
        setCategories(allCategories);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCategoryChange = async (productId: string, category: string) => {
    setSavingId(productId);
    setSuccessMsg('');
    try {
      const updated = await updateProductCategory(productId, category);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, category: updated.category } : p,
        ),
      );
      setSuccessMsg(`"${updated.name}" category updated!`);
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err) {
      console.error('Failed to update category', err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts =
    filterCategory === 'all'
      ? products
      : products.filter((p) => (p.category ?? 'other') === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-green-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product categories ({products.length} products)
          </p>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Filter by category:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Products</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Product Name</th>
              <th className="px-4 py-3 font-medium">Current Category</th>
              <th className="px-4 py-3 font-medium">New Category</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  categories={categories}
                  savingId={savingId}
                  onCategoryChange={handleCategoryChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary by category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const count = products.filter(
              (p) => (p.category ?? 'other') === cat,
            ).length;
            return (
              <div
                key={cat}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-green-700">{count}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                </div>
              </div>
            );
          })}
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{products.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  categories,
  savingId,
  onCategoryChange,
}: {
  product: Product;
  categories: string[];
  savingId: string | null;
  onCategoryChange: (productId: string, category: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState(product.category ?? 'other');
  const isSaving = savingId === product.id;

  const handleSave = () => {
    if (selectedCategory !== product.category) {
      onCategoryChange(product.id, selectedCategory);
    }
  };

  const hasChanged = selectedCategory !== (product.category ?? 'other');

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
      <td className="px-4 py-3">
        {product.category ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS] || product.category}
          </span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not set</span>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            !hasChanged || isSaving
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-700 text-white hover:bg-green-800'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-1">
              <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </button>
      </td>
    </tr>
  );
}