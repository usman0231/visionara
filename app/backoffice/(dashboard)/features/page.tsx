import { Suspense } from 'react';
import Link from 'next/link';
import { CogIcon } from '@heroicons/react/24/outline';

export default function FeaturesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <CogIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Features Page Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage pricing and features for your services. Features are automatically generated from your packages.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/features"
            target="_blank"
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Features Page
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {/* Info Card */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How it works</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>The features page automatically displays pricing and feature comparisons based on your packages:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Pricing is pulled from your <Link href="/backoffice/packages" className="font-semibold underline">packages</Link></li>
                  <li>Features are automatically organized by service category (Web, Mobile, Graphic, Marketing)</li>
                  <li>Each package tier (Basic, Standard, Enterprise) becomes a pricing column</li>
                  <li>Package features are displayed as comparison rows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Package Management Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Web Development', href: '/backoffice/packages?category=Web', color: 'blue', description: 'Manage web development packages and pricing' },
            { name: 'Mobile Apps', href: '/backoffice/packages?category=Mobile', color: 'green', description: 'Manage mobile app development packages' },
            { name: 'Graphic Design', href: '/backoffice/packages?category=Graphic', color: 'purple', description: 'Manage graphic design packages and services' },
            { name: 'Marketing', href: '/backoffice/packages?category=Marketing', color: 'orange', description: 'Manage marketing packages and campaigns' }
          ].map((service) => (
            <div key={service.name} className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className={`inline-flex rounded-lg p-3 bg-${service.color}-100`}>
                  <CogIcon className={`h-6 w-6 text-${service.color}-600`} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link href={service.href} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {service.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {service.description}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href={service.href}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Manage packages
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/backoffice/packages/new"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="rounded-lg bg-green-100 p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Add New Package</p>
                <p className="text-sm text-gray-500">Create a new service package</p>
              </div>
            </Link>

            <Link
              href="/backoffice/packages"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="rounded-lg bg-blue-100 p-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View All Packages</p>
                <p className="text-sm text-gray-500">Manage existing packages</p>
              </div>
            </Link>

            <Link
              href="/features"
              target="_blank"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <div className="flex-shrink-0">
                <div className="rounded-lg bg-purple-100 p-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Preview Features Page</p>
                <p className="text-sm text-gray-500">See how it looks to visitors</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}