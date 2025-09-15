'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ChartBarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import StatModal from '@/components/backoffice/StatModal';

interface Stat {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        setStats([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      // On any error, show empty state
      setStats([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return;

    try {
      const response = await fetch(`/api/admin/stats/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete statistic');

      await fetchStats();
    } catch (error: any) {
      alert('Failed to delete statistic: ' + error.message);
    }
  };

  const openModal = (stat?: Stat) => {
    setEditingStat(stat || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingStat(null);
    setIsModalOpen(false);
  };

  const handleSaveStat = async () => {
    await fetchStats();
    closeModal();
  };

  const formatStatValue = (stat: Stat) => {
    const prefix = stat.prefix || '';
    const suffix = stat.suffix || '';
    const value = stat.value.toLocaleString();
    return `${prefix}${value}${suffix}`;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Remove error display - we show empty state instead

  const activeStats = stats.filter(stat => stat.active);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Statistics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage key metrics and statistics displayed on your site
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Statistic
          </button>
        </div>
      </div>

      {/* Live Preview */}
      {activeStats.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activeStats
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stat) => (
                <div key={stat.id} className="overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white opacity-90">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {formatStatValue(stat)}
                  </dd>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Management Table */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Statistics</h2>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Label
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Value
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Display
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Order
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stats.map((stat) => (
                <tr key={stat.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {stat.label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stat.value.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {formatStatValue(stat)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      stat.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stat.sortOrder}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(stat)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit {stat.label}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(stat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete {stat.label}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stats.length === 0 && (
            <div className="py-12 text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No statistics</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first statistic.</p>
              <div className="mt-6">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Add Statistic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Common Examples */}
      {stats.length === 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Common Statistics Examples:</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">150+</div>
              <div className="text-xs text-gray-600">Happy Clients</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">5</div>
              <div className="text-xs text-gray-600">Years Experience</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">200+</div>
              <div className="text-xs text-gray-600">Projects Completed</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-semibold text-gray-900">99%</div>
              <div className="text-xs text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      )}

      <StatModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveStat}
        stat={editingStat}
      />
    </div>
  );
}