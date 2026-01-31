'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ServiceForm from '@/components/backoffice/ServiceForm';

interface Service {
  id: string;
  title: string;
  text: string;
  iconUrl?: string;
  active: boolean;
  sortOrder: number;
}

export default function EditServicePage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/services/${params.id}`);

        if (!response.ok) {
          setError('Service not found');
          return;
        }

        const data = await response.json();
        setService(data.service);
      } catch (err) {
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-64"></div>
          </div>
        </div>
        <div className="mt-8 bg-gray-200 rounded-lg h-96 animate-pulse"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Service Not Found</h1>
          <p className="mt-2 text-sm text-gray-500">
            The service you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Edit Service</h1>
          <p className="mt-2 text-sm text-gray-700">
            Update service details and settings
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}