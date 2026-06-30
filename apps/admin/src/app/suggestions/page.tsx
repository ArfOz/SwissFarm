'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3330/api';

interface Suggestion {
  id: string;
  farmId: string;
  farm: { id: string; name: string };
  author?: string;
  email?: string;
  message: string;
  photo?: string;
  status: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const existingHeaders = options.headers as Record<string, string> | undefined;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(existingHeaders || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }
  return res;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (readFilter) params.set('isRead', readFilter);
      const res = await authFetch(`${API_URL}/admin/suggestions?${params}`);
      if (res.ok) setSuggestions(await res.json());
    } finally {
      setLoading(false);
    }
  }, [statusFilter, readFilter]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/admin/suggestions/unread-count`);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSuggestions();
    fetchUnreadCount();
  }, [fetchSuggestions, fetchUnreadCount]);

  const handleMarkRead = async (id: string) => {
    await authFetch(`${API_URL}/admin/suggestions/${id}/read`, { method: 'PATCH' });
    fetchSuggestions();
    fetchUnreadCount();
  };

  const handleMarkUnread = async (id: string) => {
    await authFetch(`${API_URL}/admin/suggestions/${id}/unread`, { method: 'PATCH' });
    fetchSuggestions();
    fetchUnreadCount();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await authFetch(`${API_URL}/admin/suggestions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    fetchSuggestions();
  };

  const handleView = async (id: string) => {
    const res = await authFetch(`${API_URL}/admin/suggestions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelected(data);
      // Auto mark as read when viewing
      if (!data.isRead) {
        await handleMarkRead(id);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💡 Suggestions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? (
              <span className="text-blue-600 font-semibold">{unreadCount} unread</span>
            ) : (
              'All caught up'
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-4 p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Read:</label>
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        <button
          onClick={() => { setStatusFilter(''); setReadFilter(''); }}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : suggestions.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No suggestions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${!s.isRead ? 'bg-blue-50 font-semibold' : ''}`}
                    onClick={() => handleView(s.id)}
                  >
                    <td className="px-5 py-4">
                      {!s.isRead && (
                        <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full" title="Unread"></span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-900">{s.farm.name}</td>
                    <td className="px-5 py-4 text-gray-600">{s.author || 'Anonymous'}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{s.message}</td>
                    <td className="px-5 py-4">{getStatusBadge(s.status)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); s.isRead ? handleMarkUnread(s.id) : handleMarkRead(s.id); }}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          title={s.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {s.isRead ? '📩' : '📧'}
                        </button>
                        <select
                          value={s.status}
                          onChange={(e) => { e.stopPropagation(); handleUpdateStatus(s.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Suggestion Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 uppercase font-medium">Farm</span>
                <p className="text-gray-900 font-medium">{selected.farm.name}</p>
              </div>
              {selected.author && (
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Author</span>
                  <p className="text-gray-900">{selected.author}</p>
                </div>
              )}
              {selected.email && (
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Email</span>
                  <p className="text-gray-900">{selected.email}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500 uppercase font-medium">Message</span>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 mt-1">{selected.message}</p>
              </div>
              {selected.photo && (
                <div>
                  <span className="text-xs text-gray-500 uppercase font-medium">Photo</span>
                  <img src={selected.photo} alt="Suggestion" className="mt-1 rounded-lg max-h-48 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-medium">Status</span>
                {getStatusBadge(selected.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase font-medium">Read</span>
                <span className={`text-xs font-medium ${selected.isRead ? 'text-green-600' : 'text-gray-400'}`}>
                  {selected.isRead ? `✓ Read${selected.readAt ? ` at ${new Date(selected.readAt).toLocaleString('en-GB')}` : ''}` : '✗ Unread'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Created: {new Date(selected.createdAt).toLocaleString('en-GB')}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <select
                value={selected.status}
                onChange={(e) => { handleUpdateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }); }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
              <button
                onClick={() => { selected.isRead ? handleMarkUnread(selected.id) : handleMarkRead(selected.id); setSelected(null); }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {selected.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}