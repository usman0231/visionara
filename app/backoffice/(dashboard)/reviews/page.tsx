'use client';

import { useState, useEffect, Suspense } from 'react';
import { PlusIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReviewModal from '@/components/backoffice/ReviewModal';
import PageHeader from '@/components/backoffice/PageHeader';
import ToggleSwitch from '@/components/backoffice/ToggleSwitch';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface Review {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  text: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function ReviewsPage() {
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        setReviews([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setReviews(data);
    } catch (error: any) {
      // On any error, show empty state
      setReviews([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      await fetchReviews();
      showNotification('Review deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete review: ' + error.message, 'error');
    }
  };

  const openModal = (review?: Review) => {
    setEditingReview(review || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingReview(null);
    setIsModalOpen(false);
  };

  const handleSaveReview = async () => {
    await fetchReviews();
    closeModal();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update review status');
    }

    // Update local state immediately for better UX
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === id ? { ...review, active: !currentActive } : review
      )
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Remove error display - we show empty state instead

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Reviews"
        description="Manage customer reviews and testimonials that showcase your work quality."
        icon={
          <StarIcon className="h-6 w-6" />
        }
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
        action={{
          label: "Add Review",
          onClick: () => openModal(),
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      <Suspense fallback={
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      }>
        {/* Statistics */}
        {reviews.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Reviews</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{reviews.length}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Average Rating</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="text-3xl font-semibold tracking-tight text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                {renderStars(Math.round(averageRating))}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Active Reviews</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {reviews.filter(r => r.active).length}
              </dd>
            </div>
          </div>
        )}
      </Suspense>

      <Suspense fallback={
        <div className="mt-8">
          <div className="animate-pulse grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      }>
        <div className="mt-8">
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{review.name}</h3>
                    </div>
                    {review.role && (
                      <p className="text-sm text-gray-500 mb-2">{review.role}</p>
                    )}
                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>
                    <blockquote className="text-gray-700 text-sm leading-relaxed">
                      "{review.text}"
                    </blockquote>
                    <div className="mt-4 text-xs text-gray-500">
                      Order: {review.sortOrder} • Created: {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Visible:</span>
                      <ToggleSwitch
                        enabled={review.active}
                        onChange={() => {}} // Handled by onToggle
                        onToggle={(newValue) => handleToggleActive(review.id, review.active)}
                        showNotification={showNotification}
                        successMessage={review.active ? 'Review hidden from website' : 'Review published to website'}
                        size="sm"
                        title={review.active ? 'Published - Click to hide' : 'Hidden - Click to publish'}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openModal(review)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit {review.name}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete {review.name}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No reviews</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new review.</p>
            <div className="mt-6">
              <button
                onClick={() => openModal()}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add Review
              </button>
            </div>
          </div>
        )}
        </div>
      </Suspense>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveReview}
        review={editingReview}
      />
    </div>
  );
}