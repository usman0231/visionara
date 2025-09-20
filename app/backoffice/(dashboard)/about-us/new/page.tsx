import AboutContentForm from '@/components/backoffice/AboutContentForm';

export default function NewAboutContentPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Add New Content Block</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new content block for your About Us page
        </p>
      </div>

      <AboutContentForm />
    </div>
  );
}