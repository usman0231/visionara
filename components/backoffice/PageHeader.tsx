import { ReactNode } from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  iconBgColor = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
  action,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between ${className}`}>
      <div className="sm:flex-auto">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${iconBgColor} p-2`}>
            <div className={`h-6 w-6 ${iconColor}`}>
              {icon}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
      {action && (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              {action.icon}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}