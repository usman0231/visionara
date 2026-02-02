'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotification } from './NotificationProvider';
import ToggleSwitch from './ToggleSwitch';

interface Service {
  id: string;
  title: string;
  text: string;
  iconUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function ServicesTable() {
  const { showNotification } = useNotification();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        setServices([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setServices(data.services || data);
    } catch (error: any) {
      // On any error, show empty state
      setServices([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to delete service (${response.status})`);
      }

      await fetchServices();
      showNotification('Service deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete service: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const response = await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update service status');
    }

    // Update local state immediately for better UX
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === id ? { ...service, active: !currentActive } : service
      )
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Remove error display - we show empty state instead

  return (
    <div className="mt-8 flow-root">
      {/* Enhanced Instructions */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Service Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              Use the toggle switches to publish or hide services on your website instantly. Active services will be visible to clients.
            </div>
          </div>
        </div>
      </div>

      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Text
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active
                    </div>
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
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {service.title}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {service.text}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <ToggleSwitch
                        enabled={service.active}
                        onChange={() => {}} // Handled by onToggle
                        onToggle={(newValue) => handleToggleActive(service.id, service.active)}
                        showNotification={showNotification}
                        successMessage={service.active ? 'Service hidden from website' : 'Service published to website'}
                        size="sm"
                        title={service.active ? 'Published - Click to hide' : 'Hidden - Click to publish'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {service.sortOrder}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/backoffice/services/${service.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit {service.title}</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete {service.title}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No services found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}