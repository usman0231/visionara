import PackageForm from '@/components/backoffice/PackageForm';

export default function NewPackagePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Package</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new service package with pricing and features
          </p>
        </div>

        <PackageForm />
      </div>
    </div>
  );
}