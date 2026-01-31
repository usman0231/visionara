import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AboutContentForm from '@/components/backoffice/AboutContentForm';

export default function NewAboutContentPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/backoffice/about-us"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to About Us
        </Link>
      </div>

      <AboutContentForm />
    </div>
  );
}