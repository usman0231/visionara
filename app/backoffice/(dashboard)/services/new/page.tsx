import ServiceForm from '@/components/backoffice/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Create New Service</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add a new service to your offerings
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}