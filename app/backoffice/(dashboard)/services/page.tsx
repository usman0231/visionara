'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ServicesTable from '@/components/backoffice/ServicesTable';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

export default function ServicesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Services"
        description="Manage your individual services and their details that clients can book."
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        action={{
          label: "Add Service",
          href: "/backoffice/services/new",
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
          <ServicesTable />
        </Suspense>
      </div>
    </div>
  );
}