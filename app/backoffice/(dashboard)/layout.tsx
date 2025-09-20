import { ReactNode } from 'react';
import Sidebar from '@/components/backoffice/Sidebar';
import Topbar from '@/components/backoffice/Topbar';
import NotificationProvider from '@/components/backoffice/NotificationProvider';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 bg-white shadow">
            <Topbar />
          </div>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}