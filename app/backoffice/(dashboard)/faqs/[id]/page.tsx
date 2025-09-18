import { notFound } from 'next/navigation';
import FAQForm from '@/components/backoffice/FAQForm';

interface EditFAQPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getFAQ(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/faqs/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return null;
  }
}

export default async function EditFAQPage({ params }: EditFAQPageProps) {
  const { id } = await params;
  const faq = await getFAQ(id);

  if (!faq) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Edit FAQ</h1>
        <p className="mt-2 text-sm text-gray-700">
          Update the FAQ: {faq.question}
        </p>
      </div>

      <FAQForm initialData={faq} />
    </div>
  );
}