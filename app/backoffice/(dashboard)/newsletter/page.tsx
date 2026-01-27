'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  EnvelopeIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface NewsletterSubscription {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'email' | 'subscribedAt' | 'status';
type SortDirection = 'asc' | 'desc';

export default function NewsletterPage() {
  const { showNotification } = useNotification();
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [sortField, setSortField] = useState<SortField>('subscribedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  // Real-time polling
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchSubscriptions(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled]);

  const fetchSubscriptions = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/newsletter?${params.toString()}`);
      if (!response.ok) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }
      const data = await response.json();

      // Check for new subscriptions
      if (isBackgroundRefresh && subscriptions.length > 0) {
        const newSubs = data.filter((newSub: NewsletterSubscription) =>
          !subscriptions.some(existing => existing.id === newSub.id)
        );
        if (newSubs.length > 0) {
          showNotification(`${newSubs.length} new subscriber${newSubs.length > 1 ? 's' : ''}!`, 'success');
        }
      }

      setSubscriptions(data);
      setLastFetchTime(new Date());
    } catch (error: any) {
      setSubscriptions([]);
      if (!isBackgroundRefresh) {
        showNotification('Failed to load subscriptions', 'error');
      }
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subscription');

      await fetchSubscriptions();
      showNotification('Subscription deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete subscription: ' + error.message, 'error');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/newsletter/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Subscriptions exported successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to export subscriptions: ' + error.message, 'error');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = [...subscriptions]
    .filter(sub => {
      if (!searchTerm) return true;
      return sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'subscribedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const stats = {
    total: subscriptions.length,
    subscribed: subscriptions.filter(s => s.status === 'subscribed').length,
    unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Newsletter Subscriptions"
        description="Manage and export your newsletter subscriber list"
        icon={<EnvelopeIcon className="h-6 w-6" />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        action={{
          label: "Export CSV",
          onClick: handleExport,
          icon: <ArrowDownTrayIcon className="h-4 w-4" />
        }}
      />

      {/* Real-time Status Bar */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isAutoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isAutoRefreshEnabled ? 'Live updates enabled' : 'Live updates paused'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Last updated: {lastFetchTime.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSubscriptions()}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isAutoRefreshEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutoRefreshEnabled ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <dt className="truncate text-sm font-medium text-gray-500">Total Subscriptions</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.total}</dd>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <dt className="truncate text-sm font-medium text-gray-500">Active Subscribers</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">{stats.subscribed}</dd>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-red-100 p-3">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <dt className="truncate text-sm font-medium text-gray-500">Unsubscribed</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">{stats.unsubscribed}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-900">Filter Subscribers</h3>
          </div>
          <span className="text-xs text-gray-500">
            {filteredAndSortedSubscriptions.length} of {subscriptions.length} subscribers
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">Newsletter Management</h3>
            <div className="mt-1 text-sm text-purple-700">
              Export your subscriber list to CSV for email marketing campaigns. Use filters to segment your audience.
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('subscribedAt')}
                  >
                    Subscribed At {sortField === 'subscribedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">
                    IP Address
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <EnvelopeIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{subscription.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subscription.status === 'subscribed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status === 'subscribed' ? '● Active' : '○ Unsubscribed'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono hidden lg:table-cell">
                      {subscription.ipAddress || '—'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                        title="Delete subscription"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAndSortedSubscriptions.length === 0 && (
              <div className="py-12 text-center bg-white">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {subscriptions.length === 0 ? 'No subscribers yet' : 'No matches found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {subscriptions.length === 0
                    ? 'Newsletter subscribers will appear here when they sign up.'
                    : 'Try adjusting your filters to find what you\'re looking for.'
                  }
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
