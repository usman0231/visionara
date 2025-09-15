'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Stat {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  active: boolean;
  sortOrder: number;
}

interface StatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  stat?: Stat | null;
}

interface StatFormData {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  active: boolean;
  sortOrder: number;
}

const commonPrefixes = ['$', '€', '£', '+', '#'];
const commonSuffixes = ['%', '+', 'K', 'M', 'yrs', 'hrs', 'clients', 'projects'];

export default function StatModal({ isOpen, onClose, onSave, stat }: StatModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StatFormData>({
    label: '',
    value: 0,
    prefix: '',
    suffix: '',
    active: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (stat) {
      setFormData({
        label: stat.label,
        value: stat.value,
        prefix: stat.prefix || '',
        suffix: stat.suffix || '',
        active: stat.active,
        sortOrder: stat.sortOrder,
      });
    } else {
      setFormData({
        label: '',
        value: 0,
        prefix: '',
        suffix: '',
        active: true,
        sortOrder: 0,
      });
    }
  }, [stat, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = stat
        ? `/api/admin/stats/${stat.id}`
        : '/api/admin/stats';

      const response = await fetch(url, {
        method: stat ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prefix: formData.prefix.trim() || null,
          suffix: formData.suffix.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save statistic');
      }

      onSave();
    } catch (error: any) {
      // Better error handling - log error instead of alert
      console.error('Error saving statistic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StatFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPreview = () => {
    const prefix = formData.prefix.trim();
    const suffix = formData.suffix.trim();
    const value = formData.value.toLocaleString();
    return `${prefix}${value}${suffix}`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {stat ? 'Edit Statistic' : 'Add New Statistic'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Live Preview */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live Preview
                  </label>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">{formData.label || 'Your Label'}</div>
                    <div className="text-2xl font-semibold">{getPreview()}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                      Label *
                    </label>
                    <input
                      type="text"
                      id="label"
                      required
                      value={formData.label}
                      onChange={(e) => handleInputChange('label', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Happy Clients"
                    />
                  </div>

                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                      Value *
                    </label>
                    <input
                      type="number"
                      id="value"
                      required
                      min="0"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="150"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                        Prefix
                      </label>
                      <input
                        type="text"
                        id="prefix"
                        value={formData.prefix}
                        onChange={(e) => handleInputChange('prefix', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="$, +, #"
                        maxLength={3}
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {commonPrefixes.map(prefix => (
                          <button
                            key={prefix}
                            type="button"
                            onClick={() => handleInputChange('prefix', prefix)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            {prefix}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
                        Suffix
                      </label>
                      <input
                        type="text"
                        id="suffix"
                        value={formData.suffix}
                        onChange={(e) => handleInputChange('suffix', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="%, +, yrs"
                        maxLength={10}
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {commonSuffixes.map(suffix => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => handleInputChange('suffix', suffix)}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        id="sortOrder"
                        value={formData.sortOrder}
                        onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                        className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (stat ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}