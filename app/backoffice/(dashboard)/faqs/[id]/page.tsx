import { notFound } from 'next/navigation';
import FAQForm from '@/components/backoffice/FAQForm';
import { FAQ } from '@/lib/db/models';

interface EditFAQPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getFAQ(id: string) {
  try {
    // Directly query database instead of API call to avoid URL issues on Vercel
    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return null;
    }

    // Convert Sequelize model to plain object and serialize dates for client component
    const plainFaq = faq.get({ plain: true });
    return {
      id: plainFaq.id,
      question: plainFaq.question,
      answer: plainFaq.answer,
      category: plainFaq.category,
      sortOrder: plainFaq.sortOrder,
      active: plainFaq.active,
      createdAt: plainFaq.createdAt instanceof Date ? plainFaq.createdAt.toISOString() : String(plainFaq.createdAt),
      updatedAt: plainFaq.updatedAt instanceof Date ? plainFaq.updatedAt.toISOString() : String(plainFaq.updatedAt),
    };
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