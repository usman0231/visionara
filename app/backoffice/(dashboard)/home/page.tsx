'use client';

import { useState, useEffect, Suspense } from 'react';
import StatsCard from '@/components/backoffice/StatsCard';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';
import Link from 'next/link';
import {
  WrenchScrewdriverIcon,
  CubeIcon,
  StarIcon,
  PhotoIcon,
  EnvelopeIcon,
  UsersIcon,
  HomeIcon,
  CogIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  services: { total: number; active: number; change: string };
  packages: { total: number; available: number; change: string };
  reviews: { total: number; active: number; avgRating: number; change: string };
  gallery: { total: number; active: number; recentUploads: number; change: string };
  contacts: { total: number; unread: number; thisWeek: number; change: string };
  stats: { total: number; active: number; change: string };
}

interface RecentActivity {
  id: string;
  type: 'contact' | 'review' | 'gallery' | 'service' | 'package' | 'system';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export default function DashboardPage() {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        servicesRes,
        packagesRes,
        reviewsRes,
        galleryRes,
        contactsRes,
        statsRes
      ] = await Promise.all([
        fetch('/api/admin/services').catch(() => null),
        fetch('/api/admin/packages').catch(() => null),
        fetch('/api/admin/reviews').catch(() => null),
        fetch('/api/admin/projects').catch(() => null),
        fetch('/api/admin/contacts').catch(() => null),
        fetch('/api/admin/stats').catch(() => null)
      ]);

      const [
        services,
        packages,
        reviews,
        gallery,
        contacts,
        siteStats
      ] = await Promise.all([
        servicesRes && servicesRes.ok ? servicesRes.json() : [],
        packagesRes && packagesRes.ok ? packagesRes.json() : [],
        reviewsRes && reviewsRes.ok ? reviewsRes.json() : [],
        galleryRes && galleryRes.ok ? galleryRes.json() : [],
        contactsRes && contactsRes.ok ? contactsRes.json() : [],
        statsRes && statsRes.ok ? statsRes.json() : []
      ]);

      // Calculate statistics
      const dashboardStats: DashboardStats = {
        services: {
          total: services.length || 0,
          active: services.filter?.((s: any) => s.active)?.length || 0,
          change: `${services.filter?.((s: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(s.createdAt) > weekAgo;
          })?.length || 0} this week`
        },
        packages: {
          total: packages.length || 0,
          available: packages.filter?.((p: any) => p.available)?.length || 0,
          change: `${packages.filter?.((p: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(p.createdAt) > weekAgo;
          })?.length || 0} this week`
        },
        reviews: {
          total: reviews.length || 0,
          active: reviews.filter?.((r: any) => r.active)?.length || 0,
          avgRating: reviews.length > 0 ?
            parseFloat((reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)) : 0,
          change: `${reviews.filter?.((r: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(r.createdAt) > weekAgo;
          })?.length || 0} this week`
        },
        gallery: {
          total: gallery.length || 0,
          active: gallery.filter?.((g: any) => g.active)?.length || 0,
          recentUploads: gallery.filter?.((g: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(g.createdAt) > weekAgo;
          })?.length || 0,
          change: `${gallery.filter?.((g: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(g.createdAt) > weekAgo;
          })?.length || 0} this week`
        },
        contacts: {
          total: contacts.length || 0,
          unread: contacts.filter?.((c: any) => c.status === 'unread')?.length || 0,
          thisWeek: contacts.filter?.((c: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(c.createdAt) > weekAgo;
          })?.length || 0,
          change: `${contacts.filter?.((c: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(c.createdAt) > weekAgo;
          })?.length || 0} this week`
        },
        stats: {
          total: siteStats.length || 0,
          active: siteStats.filter?.((s: any) => s.active)?.length || 0,
          change: `${siteStats.filter?.((s: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(s.createdAt) > weekAgo;
          })?.length || 0} this week`
        }
      };

      setStats(dashboardStats);

      // Generate recent activity based on real data
      const activity: RecentActivity[] = [
        ...contacts.slice(0, 3).map((contact: any) => ({
          id: `contact-${contact.id}`,
          type: 'contact' as const,
          message: `New contact from ${contact.name}`,
          timestamp: contact.createdAt,
          status: 'info' as const
        })),
        ...reviews.slice(0, 2).map((review: any) => ({
          id: `review-${review.id}`,
          type: 'review' as const,
          message: `New ${review.rating}-star review from ${review.name}`,
          timestamp: review.createdAt,
          status: 'success' as const
        })),
        ...gallery.slice(0, 2).map((item: any) => ({
          id: `gallery-${item.id}`,
          type: 'gallery' as const,
          message: `New image uploaded: ${item.alt}`,
          timestamp: item.createdAt,
          status: 'success' as const
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

      setRecentActivity(activity);

    } catch (err: any) {
      setError('Failed to load dashboard data');
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="mt-12 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return EnvelopeIcon;
      case 'review': return StarIcon;
      case 'gallery': return PhotoIcon;
      case 'service': return WrenchScrewdriverIcon;
      case 'package': return CubeIcon;
      default: return CheckCircleIcon;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard"
        description="Welcome to your Visionara backoffice. Manage your site content and view real-time analytics."
        icon={<HomeIcon className="h-6 w-6" />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
      />

      <Suspense fallback={
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      }>
        {/* System Status Alert */}
        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">System Alert</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Quick Actions</h3>
                <div className="mt-1 text-sm text-blue-700">
                  Common tasks and shortcuts to manage your website efficiently.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/backoffice/gallery"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Add Image
              </Link>
              <Link
                href="/backoffice/services"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Add Service
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/services" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Services</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.services.total || 0}
                      </p>
                      <p className="ml-2 text-sm text-green-600">
                        {stats?.services.active || 0} active
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.services.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/packages" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CubeIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Packages</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.packages.total || 0}
                      </p>
                      <p className="ml-2 text-sm text-green-600">
                        {stats?.packages.available || 0} available
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.packages.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/reviews" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <StarIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Reviews</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.reviews.total || 0}
                      </p>
                      <p className="ml-2 text-sm text-yellow-600">
                        ⭐ {stats?.reviews.avgRating || 0}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.reviews.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/gallery" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Gallery</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.gallery.total || 0}
                      </p>
                      <p className="ml-2 text-sm text-green-600">
                        {stats?.gallery.recentUploads || 0} recent
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.gallery.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/contacts" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Contacts</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.contacts.total || 0}
                      </p>
                      {stats?.contacts.unread ? (
                        <p className="ml-2 text-sm text-red-600">
                          {stats.contacts.unread} unread
                        </p>
                      ) : (
                        <p className="ml-2 text-sm text-green-600">All read</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.contacts.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/backoffice/stats" className="block">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Statistics</p>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.stats.total || 0}
                      </p>
                      <p className="ml-2 text-sm text-green-600">
                        {stats?.stats.active || 0} active
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      +{stats?.stats.change || '0 this week'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <Link
              href="/backoffice/contacts"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className={`flex items-center p-3 rounded-lg border ${getActivityColor(activity.status)}`}
                      >
                        <div className="flex-shrink-0">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium">
                            {activity.message}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs font-medium">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Activity will appear here as users interact with your site.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">System Health</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm font-medium text-gray-900">Database</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Connected & Healthy</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm font-medium text-gray-900">API Services</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">All endpoints operational</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm font-medium text-gray-900">File Storage</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Upload system active</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}