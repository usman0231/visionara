import { notFound } from 'next/navigation';
import AboutContentForm from '@/components/backoffice/AboutContentForm';

interface EditAboutContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getAboutContent(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/about-content/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching about content:', error);
    return null;
  }
}

export default async function EditAboutContentPage({ params }: EditAboutContentPageProps) {
  const { id } = await params;
  const content = await getAboutContent(id);

  if (!content) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Edit Content Block</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the content block: {content.title}
        </p>
      </div>

      <AboutContentForm initialData={content} />
    </div>
  );
}