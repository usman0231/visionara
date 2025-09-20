'use client';

import { useState, useEffect, Suspense } from 'react';
import StatsCard from '@/components/backoffice/StatsCard';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';
import {
  WrenchScrewdriverIcon,
  CubeIcon,
  StarIcon,
  PhotoIcon,
  EnvelopeIcon,
  UsersIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

// Mock data fetcher — replace with real DB/API calls later
async function getDashboardStats() {
  return {
    services: { count: 4, change: '+2 this month' },
    packages: { count: 12, change: '+1 this week' },
    reviews: { count: 24, change: '+5 this month' },
    gallery: { count: 18, change: '+3 this week' },
    contacts: { count: 47, change: '+12 this month' },
    users: { count: 3, change: 'No change' },
  };
}

export default function DashboardPage() {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header matching About Us pattern */}
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2">
              <HomeIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome to your Visionara backoffice. Manage your site content and view analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="mt-12">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      }>
        {/* Enhanced Instructions */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Dashboard Overview</h3>
              <div className="mt-1 text-sm text-blue-700">
                Click on any card below to navigate to that section and manage your content.
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Services"
            value={stats.services.count}
            change={stats.services.change}
            icon={WrenchScrewdriverIcon}
            href="/backoffice/services"
          />

          <StatsCard
            title="Packages"
            value={stats.packages.count}
            change={stats.packages.change}
            icon={CubeIcon}
            href="/backoffice/packages"
          />

          <StatsCard
            title="Reviews"
            value={stats.reviews.count}
            change={stats.reviews.change}
            icon={StarIcon}
            href="/backoffice/reviews"
          />

          <StatsCard
            title="Gallery Items"
            value={stats.gallery.count}
            change={stats.gallery.change}
            icon={PhotoIcon}
            href="/backoffice/gallery"
          />

          <StatsCard
            title="Contact Submissions"
            value={stats.contacts.count}
            change={stats.contacts.change}
            icon={EnvelopeIcon}
            href="/backoffice/contacts"
          />

          <StatsCard
            title="Users"
            value={stats.users.count}
            change={stats.users.change}
            icon={UsersIcon}
            href="/backoffice/settings"
          />
        </div>

        {/* Enhanced Recent Activity with About Us styling */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <div className="text-sm text-gray-600">
                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="flex-1 font-medium text-green-800">Database initialized successfully</span>
                    <span className="text-green-600 text-xs font-medium">Just now</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="flex-1 font-medium text-blue-800">New user logged in</span>
                    <span className="text-blue-600 text-xs font-medium">2 minutes ago</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3 shadow-sm"></div>
                    <span className="flex-1 font-medium text-yellow-800">Sample content seeded</span>
                    <span className="text-yellow-600 text-xs font-medium">5 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
