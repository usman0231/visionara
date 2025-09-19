'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Notification from './Notification';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const categoryColors = {
  'General': 'bg-blue-100 text-blue-800',
  'Technical': 'bg-green-100 text-green-800',
  'Pricing': 'bg-yellow-100 text-yellow-800',
  'Support': 'bg-purple-100 text-purple-800',
  'Other': 'bg-gray-100 text-gray-800'
};

interface SortableRowProps {
  faq: FAQ;
  onDelete: (id: string) => void;
}

function SortableRow({ faq, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'shadow-lg bg-gray-50' : ''}`}
    >
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
        <div className="flex items-center gap-3">
          <div
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            {faq.category && (
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getCategoryColor(faq.category)}`}>
                {faq.category}
              </span>
            )}
            <span className="font-medium max-w-md truncate">{faq.question}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        <div className="max-w-xs">
          <div className="truncate">{faq.answer.substring(0, 150)}...</div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch(`/api/admin/faqs/${faq.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ active: !faq.active }),
                });
                if (response.ok) {
                  // Show notification
                  const event = new CustomEvent('showFAQNotification', {
                    detail: {
                      message: `FAQ ${!faq.active ? 'activated' : 'deactivated'} successfully`,
                      type: 'success'
                    }
                  });
                  window.dispatchEvent(event);

                  // Update UI immediately without reload
                  faq.active = !faq.active;

                  // Force component re-render
                  const table = document.querySelector('table');
                  if (table) {
                    table.style.opacity = '0.95';
                    setTimeout(() => {
                      table.style.opacity = '1';
                    }, 100);
                  }
                } else {
                  throw new Error('Failed to update FAQ status');
                }
              } catch (error) {
                console.error('Error updating FAQ status:', error);
                const event = new CustomEvent('showFAQNotification', {
                  detail: {
                    message: 'Failed to update FAQ status',
                    type: 'error'
                  }
                });
                window.dispatchEvent(event);
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/30 ${
              faq.active
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 focus:ring-emerald-300'
                : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
            }`}
            title={faq.active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out border border-white/60 backdrop-blur-sm ${
                faq.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        #{faq.sortOrder}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/backoffice/faqs/${faq.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit FAQ</span>
          </Link>
          <button
            onClick={() => onDelete(faq.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete FAQ</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function FAQTable() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    const handleNotification = (event: any) => {
      setNotification({
        show: true,
        message: event.detail.message,
        type: event.detail.type
      });
    };

    window.addEventListener('showFAQNotification', handleNotification);
    return () => window.removeEventListener('showFAQNotification', handleNotification);
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/admin/faqs');
      if (!response.ok) {
        setFaqs([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error: any) {
      setFaqs([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete FAQ');

      await fetchFAQs();
    } catch (error: any) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsReordering(true);

    const filteredFAQs = selectedCategory === 'all'
      ? faqs
      : faqs.filter(faq => faq.category === selectedCategory);

    const oldIndex = filteredFAQs.findIndex((faq) => faq.id === active.id);
    const newIndex = filteredFAQs.findIndex((faq) => faq.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedFAQs = arrayMove(filteredFAQs, oldIndex, newIndex);

      // Calculate new sort orders
      const updatedFAQs = reorderedFAQs.map((faq, index) => ({
        ...faq,
        sortOrder: index + 1
      }));

      // Update local state immediately for smooth UX
      const allFAQsWithUpdates = faqs.map(faq => {
        const updated = updatedFAQs.find(u => u.id === faq.id);
        return updated || faq;
      });

      const sortedFAQs = allFAQsWithUpdates.sort((a, b) => a.sortOrder - b.sortOrder);
      setFaqs(sortedFAQs);

      // Send updates to the server
      try {
        await Promise.all(
          updatedFAQs.map((faq) =>
            fetch(`/api/admin/faqs/${faq.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sortOrder: faq.sortOrder
              }),
            })
          )
        );

        // Refresh data to ensure consistency
        await fetchFAQs();
      } catch (error) {
        console.error('Failed to update sort orders:', error);
        await fetchFAQs();
      }
    }

    setIsReordering(false);
  };

  // Get unique categories from FAQs
  const categories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flow-root">
      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category!)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? categoryColors[category as keyof typeof categoryColors] || 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          {isReordering && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              Updating order...
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      <div className="flex items-center gap-2">
                        <Bars3Icon className="h-4 w-4 text-gray-400" />
                        Question
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Answer Preview
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Active
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Order
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={filteredFAQs.map(faq => faq.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredFAQs.map((faq) => (
                      <SortableRow key={faq.id} faq={faq} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
              {filteredFAQs.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">
                    {selectedCategory === 'all' ? 'No FAQs found' : `No FAQs found in ${selectedCategory} category`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DndContext>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}