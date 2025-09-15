'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export default function StatsCard({ title, value, change, icon: Icon, href }: StatsCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                  </div>
                  <div className="ml-2 flex items-baseline text-sm">
                    <span className="text-gray-500">
                      {change}
                    </span>
                  </div>
                </dd>
              </dl>
            </div>
            <div className="flex-shrink-0">
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}