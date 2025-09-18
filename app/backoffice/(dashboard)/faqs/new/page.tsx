import FAQForm from '@/components/backoffice/FAQForm';

export default function NewFAQPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Add New FAQ</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new frequently asked question
        </p>
      </div>

      <FAQForm />
    </div>
  );
}