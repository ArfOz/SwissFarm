'use client';

import { useState, useEffect } from 'react';
import {
  fetchAllProducts,
  fetchProductCategories,
  updateProductCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/api';
import { CATEGORY_LABELS } from '@swissfarm/types';

interface Product {
  id: string;
  name: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleCategoryChange = async (productId: string, categoryId: string) => {
    setSavingId(productId);
    try {
      const updated = await updateProductCategory(productId, categoryId);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, category: updated.category } : p,
        ),
      );
      showSuccess(`"${updated.name}" category updated!`);
    } catch (err) {
      console.error('Failed to update category', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateProduct = async (name: string, categoryId: string) => {
    const created = await createProduct(name, categoryId);
    setProducts((prev) => [...prev, created]);
    showSuccess(`"${created.name}" created!`);
  };

  const handleUpdateProduct = async (id: string, name: string, categoryId: string) => {
    const updated = await updateProduct(id, { name, categoryId });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: updated.name, category: updated.category } : p)),
    );
    showSuccess(`"${updated.name}" updated!`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      const result = await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      showSuccess(result.message);
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
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
            Manage products and categories ({products.length} products)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
        >
          + Add Product
        </button>
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
            <option key={cat.id} value={cat.name}>
              {CATEGORY_LABELS[cat.name] || cat.name}
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
              <th className="px-4 py-3 font-medium">Actions</th>
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
                  onEdit={() => openEditModal(product)}
                  onDelete={() => handleDeleteProduct(product)}
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
              (p) => (p.category ?? 'other') === cat.name,
            ).length;
            return (
              <div
                key={cat.id}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-bold text-green-700">{count}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {CATEGORY_LABELS[cat.name] || cat.name}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={async (name, categoryId) => {
            if (editingProduct) {
              await handleUpdateProduct(editingProduct.id, name, categoryId);
            } else {
              await handleCreateProduct(name, categoryId);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function ProductRow({
  product,
  categories,
  savingId,
  onCategoryChange,
  onEdit,
  onDelete,
}: {
  product: Product;
  categories: Category[];
  savingId: string | null;
  onCategoryChange: (productId: string, categoryId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Find current category name, default to first category
  const currentCategoryName = product.category ?? categories[0]?.name ?? 'other';
  const currentCategory = categories.find((c) => c.name === currentCategoryName) ?? categories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState(currentCategory?.id ?? '');
  const isSaving = savingId === product.id;
  const hasChanged = selectedCategoryId !== currentCategory?.id;

  const handleSave = () => {
    if (hasChanged) {
      onCategoryChange(product.id, selectedCategoryId);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
      <td className="px-4 py-3">
        {product.category ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {CATEGORY_LABELS[product.category] || product.category}
          </span>
        ) : (
          <span className="text-gray-400 text-xs italic">Not set</span>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {CATEGORY_LABELS[cat.name] || cat.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
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
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductFormModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (name: string, categoryId: string) => Promise<void>;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const currentCategory = categories.find((c) => c.name === (product?.category ?? 'other')) ?? categories[0];
  const [categoryId, setCategoryId] = useState(currentCategory?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim(), categoryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Fresh Milk"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {CATEGORY_LABELS[cat.name] || cat.name}
                </option>
              ))}
            </select>
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
              disabled={saving || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}