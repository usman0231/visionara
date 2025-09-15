'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PackageForm from '@/components/backoffice/PackageForm';

interface Package {
  id: string;
  category: 'Web' | 'Mobile' | 'Graphic' | 'Marketing';
  tier: 'Basic' | 'Standard' | 'Enterprise';
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditPackagePage() {
  const params = useParams();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/admin/packages/${params.id}`);

        if (!response.ok) {
          setError('Package not found');
          return;
        }

        const data = await response.json();
        setPackageData(data);
      } catch (err) {
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    }

    fetchPackage();
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Package Not Found</h1>
            <p className="mt-2 text-sm text-gray-500">
              The package you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Package</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update package details, pricing, and features
          </p>
        </div>

        <PackageForm initialData={packageData} />
      </div>
    </div>
  );
}