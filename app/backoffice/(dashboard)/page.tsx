import StatsCard from '@/components/backoffice/StatsCard';

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

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your Visionara backoffice. Manage your site content and view analytics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Services"
          value={stats.services.count}
          change={stats.services.change}
          icon="wrench"
          href="/backoffice/services"
        />

        <StatsCard
          title="Packages"
          value={stats.packages.count}
          change={stats.packages.change}
          icon="cube"
          href="/backoffice/packages"
        />

        <StatsCard
          title="Reviews"
          value={stats.reviews.count}
          change={stats.reviews.change}
          icon="star"
          href="/backoffice/reviews"
        />

        <StatsCard
          title="Gallery Items"
          value={stats.gallery.count}
          change={stats.gallery.change}
          icon="photo"
          href="/backoffice/gallery"
        />

        <StatsCard
          title="Contact Submissions"
          value={stats.contacts.count}
          change={stats.contacts.change}
          icon="envelope"
          href="/backoffice/contacts"
        />

        <StatsCard
          title="Users"
          value={stats.users.count}
          change={stats.users.change}
          icon="users"
          href="/backoffice/settings"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-12">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="text-sm text-gray-600">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Database initialized successfully</span>
                  <span className="ml-auto text-gray-400">Just now</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>New user logged in</span>
                  <span className="ml-auto text-gray-400">2 minutes ago</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span>Sample content seeded</span>
                  <span className="ml-auto text-gray-400">5 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
