'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQFormProps {
  initialData?: FAQ;
}

const predefinedCategories = ['General', 'Technical', 'Pricing', 'Support', 'Other'];

export default function FAQForm({ initialData }: FAQFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        category: initialData.category || 'General',
        active: initialData.active,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData
        ? `/api/admin/faqs/${initialData.id}`
        : '/api/admin/faqs';

      const response = await fetch(url, {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sortOrder: initialData?.sortOrder, // Keep existing order for updates, let API handle new ones
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save FAQ');
      }

      router.push('/backoffice/faqs');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      alert(error.message || 'Failed to save FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {initialData ? 'Edit FAQ' : 'Create FAQ'}
                </h2>
                <p className="text-sm text-gray-600">
                  {initialData ? 'Update this FAQ item' : 'Add a new frequently asked question'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">FAQ Details</h3>
            <p className="text-sm text-gray-600 mt-1">Provide clear and helpful information for your users</p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-900 mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="question"
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="What engagement models do you offer?"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a clear, concise question that users commonly ask</p>
              </div>

              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-900 mb-2">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="answer"
                  rows={6}
                  value={formData.answer}
                  onChange={(e) => handleInputChange('answer', e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="Fixed-scope projects, monthly product pods, or augmenting your in-house team."
                  required
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Provide a comprehensive, helpful answer</p>
                  <p className="text-xs text-gray-500">
                    {formData.answer.length} characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  >
                    {predefinedCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Group related FAQs together</p>
                </div>

                {initialData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Display Order
                    </label>
                    <div className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-500 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm">
                      {initialData.sortOrder}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Order is automatically managed</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Status
                </label>
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-white/40 to-gray-50/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formData.active ? 'Active' : 'Inactive'}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.active
                        ? 'This FAQ is visible on your website'
                        : 'This FAQ is hidden from your website'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('active', !formData.active)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-30 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/30 ${
                      formData.active
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 focus:ring-emerald-300'
                        : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out border-2 border-white/50 backdrop-blur-sm ${
                        formData.active ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                    <span className="sr-only">Toggle FAQ status</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
          <div className="flex items-center justify-between gap-x-6 px-6 py-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : (initialData ? 'Update FAQ' : 'Create FAQ')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}