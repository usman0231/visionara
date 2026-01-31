import { notFound } from 'next/navigation';
import AboutContentForm from '@/components/backoffice/AboutContentForm';
import { AboutContent } from '@/lib/db/models';

interface EditAboutContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getAboutContent(id: string) {
  try {
    const content = await AboutContent.findByPk(id);
    if (!content) {
      return null;
    }
    const data = content.toJSON();
    // Convert dates to ISO strings for serialization
    return {
      ...data,
      createdAt: data.createdAt?.toISOString?.() || data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() || data.updatedAt,
    };
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
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <a
          href="/backoffice/about-us"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to About Us
        </a>
      </div>

      <AboutContentForm initialData={content} />
    </div>
  );
}