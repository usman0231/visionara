'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  text: z.string().min(1, 'Text is required'),
  iconUrl: z.string().url('Icon URL must be a valid URL').optional().or(z.literal('')),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: ServiceFormData & { id: string };
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      title: '',
      text: '',
      iconUrl: '',
      active: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (service) {
      reset(service);
    }
  }, [service, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Clean the data
      const filteredData = {
        ...data,
        iconUrl: data.iconUrl || undefined,
      };

      const url = service ? `/api/services/${service.id}` : '/api/services';
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save service');
      }

      router.push('/backoffice/services');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('title')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  {...register('sortOrder', { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.sortOrder && (
                <p className="mt-2 text-sm text-red-600">{errors.sortOrder.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700">
                Icon URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  {...register('iconUrl')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.iconUrl && (
                <p className="mt-2 text-sm text-red-600">{errors.iconUrl.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Text
              </label>
              <div className="mt-1">
                <textarea
                  rows={4}
                  {...register('text')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              {errors.text && (
                <p className="mt-2 text-sm text-red-600">{errors.text.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  {...register('active')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : service ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
}