'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import PackagesTable from '@/components/backoffice/PackagesTable';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

export default function PackagesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Packages"
        description="Manage your service packages and pricing tiers that define your offerings."
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
        action={{
          label: "Add Package",
          href: "/backoffice/packages/new",
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      <div className="mt-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <PackagesTable />
        </Suspense>
      </div>
    </div>
  );
}