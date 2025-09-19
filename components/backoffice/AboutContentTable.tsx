'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Notification from './Notification';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Section = 'hero' | 'story' | 'values' | 'services' | 'tech' | 'testimonials' | 'stats' | 'cta';

interface AboutContent {
  id: string;
  section: Section;
  title: string;
  subtitle: string | null;
  content: Record<string, any>;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const SECTION_LABELS: Record<Section, string> = {
  hero: 'Hero',
  story: 'Story',
  values: 'Values',
  services: 'Services',
  tech: 'Technology',
  testimonials: 'Testimonials',
  stats: 'Statistics',
  cta: 'Call to Action',
};

const SECTION_BADGES: Record<Section, string> = {
  hero: 'bg-purple-100 text-purple-800',
  story: 'bg-blue-100 text-blue-800',
  values: 'bg-green-100 text-green-800',
  services: 'bg-yellow-100 text-yellow-800',
  tech: 'bg-indigo-100 text-indigo-800',
  testimonials: 'bg-pink-100 text-pink-800',
  stats: 'bg-cyan-100 text-cyan-800',
  cta: 'bg-orange-100 text-orange-800',
};

interface SortableRowProps {
  item: AboutContent;
  onDelete: (id: string) => void;
}

function getContentPreview(item: AboutContent): string {
  const data = item.content;
  switch (item.section) {
    case 'hero':
      return data?.description?.slice(0, 100) ?? '';
    case 'story':
      return data?.text?.slice(0, 100) ?? '';
    case 'values':
      return `${data?.items?.length ?? 0} value items`;
    case 'services':
      return `${data?.items?.length ?? 0} service groups`;
    case 'tech':
      return `${data?.technologies?.length ?? 0} technologies`;
    case 'testimonials':
      return `${data?.testimonials?.length ?? 0} testimonials`;
    case 'stats':
      return `${data?.stats?.length ?? 0} statistics`;
    case 'cta':
      return data?.description?.slice(0, 100) ?? '';
    default:
      return '';
  }
}

function SortableRow({ item, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  const preview = useMemo(() => getContentPreview(item), [item]);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-all duration-200 ${
        isDragging ? 'bg-blue-50 shadow-lg ring-2 ring-blue-200 ring-opacity-50' : 'hover:bg-gray-50'
      }`}
    >
      <td className='py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='cursor-grab rounded-md p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1'
            aria-label={`Drag to reorder ${item.title}`}
            title='Drag to reorder'
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className='h-5 w-5' />
          </button>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SECTION_BADGES[item.section]}`}>
                {SECTION_LABELS[item.section]}
              </span>
              {!item.active && (
                <span className='inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'>
                  Draft
                </span>
              )}
            </div>
            <span className='font-semibold text-gray-900'>{item.title}</span>
            {item.subtitle && <span className='text-sm text-gray-600'>{item.subtitle}</span>}
          </div>
        </div>
      </td>
      <td className='px-3 py-4 text-sm text-gray-600'>
        <div className='max-w-xs'>
          <p className='truncate' title={preview}>
            {preview || <span className='italic text-gray-400'>No preview available</span>}
          </p>
        </div>
      </td>
      <td className='whitespace-nowrap px-3 py-4 text-sm'>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch(`/api/admin/about-content/${item.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ active: !item.active }),
                });
                if (response.ok) {
                  // Show notification
                  const event = new CustomEvent('showNotification', {
                    detail: {
                      message: `Content ${!item.active ? 'published' : 'unpublished'} successfully`,
                      type: 'success'
                    }
                  });
                  window.dispatchEvent(event);

                  // Update UI immediately without reload
                  item.active = !item.active;

                  // Force component re-render
                  const table = document.querySelector('table');
                  if (table) {
                    table.style.opacity = '0.95';
                    setTimeout(() => {
                      table.style.opacity = '1';
                    }, 100);
                  }
                } else {
                  throw new Error('Failed to update status');
                }
              } catch (error) {
                console.error('Error updating status:', error);
                const event = new CustomEvent('showNotification', {
                  detail: {
                    message: 'Failed to update status',
                    type: 'error'
                  }
                });
                window.dispatchEvent(event);
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/30 ${
              item.active
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 focus:ring-emerald-300'
                : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
            }`}
            title={item.active ? 'Published - Click to unpublish' : 'Draft - Click to publish'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out border border-white/60 backdrop-blur-sm ${
                item.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </td>
      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
        <span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800'>
          #{item.sortOrder}
        </span>
      </td>
      <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
        <div className='flex items-center justify-end gap-1'>
          <Link
            href={`/backoffice/about-us/${item.id}`}
            className='inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1'
            title={`Edit ${item.title}`}
          >
            <PencilIcon className='h-4 w-4' />
            <span className='ml-1 hidden sm:inline'>Edit</span>
          </Link>
          <button
            type='button'
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
                onDelete(item.id);
              }
            }}
            className='inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1'
            title={`Delete ${item.title}`}
          >
            <TrashIcon className='h-4 w-4' />
            <span className='ml-1 hidden sm:inline'>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AboutContentTable() {
  const [contents, setContents] = useState<AboutContent[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/about-content', { cache: 'no-store' });
      if (!response.ok) {
        setError('Failed to load content blocks');
        setContents([]);
        return;
      }
      const data = await response.json();
      const sorted = Array.isArray(data)
        ? [...data].sort(
            (a: AboutContent, b: AboutContent) =>
              a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt)
          )
        : [];
      setContents(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to load about content:', err);
      setContents([]);
      setError('Failed to load content blocks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  useEffect(() => {
    const handleNotification = (event: any) => {
      setNotification({
        show: true,
        message: event.detail.message,
        type: event.detail.type
      });
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this content block?')) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/about-content/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to delete content');
        }
        await fetchContents();
      } catch (err) {
        console.error('Failed to delete content:', err);
        setError('Failed to delete content block');
      }
    },
    [fetchContents]
  );

  const filteredContents = useMemo(() => {
    if (selectedSection === 'all') {
      return contents;
    }
    return contents.filter((item) => item.section === selectedSection);
  }, [contents, selectedSection]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      setIsReordering(true);

      // Get the items we're working with (either all or filtered)
      const workingItems = selectedSection === 'all' ? contents : filteredContents;

      const oldIndex = workingItems.findIndex((item) => item.id === active.id);
      const newIndex = workingItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        setIsReordering(false);
        return;
      }

      // Reorder the working items
      const reordered = arrayMove([...workingItems], oldIndex, newIndex);

      if (selectedSection === 'all') {
        // Update all items with new sort order
        const withOrder = reordered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
        setContents(withOrder);

        try {
          await Promise.all(
            withOrder.map((item) =>
              fetch(`/api/admin/about-content/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sortOrder: item.sortOrder }),
              })
            )
          );
          setError(null);
        } catch (err) {
          console.error('Failed to update sort orders:', err);
          setError('Failed to update order. Please try again.');
          await fetchContents();
        }
      } else {
        // Update only items within the same section
        const updatedContents = [...contents];
        const sectionItems = reordered.map((item, index) => ({
          ...item,
          sortOrder: index + 1
        }));

        // Replace the section items in the full contents array
        sectionItems.forEach((sectionItem) => {
          const globalIndex = updatedContents.findIndex((item) => item.id === sectionItem.id);
          if (globalIndex !== -1) {
            updatedContents[globalIndex] = sectionItem;
          }
        });

        setContents(updatedContents);

        try {
          await Promise.all(
            sectionItems.map((item) =>
              fetch(`/api/admin/about-content/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sortOrder: item.sortOrder }),
              })
            )
          );
          setError(null);
        } catch (err) {
          console.error('Failed to update sort orders:', err);
          setError('Failed to update order. Please try again.');
          await fetchContents();
        }
      }

      setIsReordering(false);
    },
    [contents, filteredContents, fetchContents, selectedSection]
  );

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='mb-4 h-8 rounded bg-gray-200' />
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='h-16 rounded bg-gray-200' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='mt-8 flow-root'>
      {/* Enhanced Filter Section */}
      <div className='mb-6 rounded-lg border border-gray-200 bg-white p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-900'>Filter by Section</h3>
          <span className='text-xs text-gray-500'>
            {filteredContents.length} of {contents.length} items
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <button
            type='button'
            onClick={() => {
              setSelectedSection('all');
              setError(null);
            }}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
              selectedSection === 'all'
                ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            All Sections
          </button>
          {Object.entries(SECTION_LABELS).map(([section, label]) => (
            <button
              key={section}
              type='button'
              onClick={() => {
                setSelectedSection(section as Section);
                setError(null);
              }}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                selectedSection === section
                  ? `${SECTION_BADGES[section as Section]} ring-2 ring-opacity-50`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
              title={`View ${label} content`}
            >
              {label}
            </button>
          ))}
        </div>
        {isReordering && (
          <div className='mt-3 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700'>
            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600' />
            Updating content order...
          </div>
        )}
      </div>

      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Action Required</h3>
              <div className='mt-1 text-sm text-red-700'>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Instructions */}
      <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <svg className='h-5 w-5 text-blue-400' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
            </svg>
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-blue-800'>How to use</h3>
            <div className='mt-1 text-sm text-blue-700'>
              Drag items using the <Bars3Icon className='inline h-4 w-4' /> handle to reorder content. Changes are saved automatically.
            </div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th scope='col' className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                    <div className='flex items-center gap-2'>
                      <Bars3Icon className='h-4 w-4 text-gray-400' />
                      Content Block
                    </div>
                  </th>
                  <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                    <div className='flex items-center gap-1'>
                      <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                      Preview
                    </div>
                  </th>
                  <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                    <div className='flex items-center gap-1'>
                      <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      Published
                    </div>
                  </th>
                  <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                    <div className='flex items-center gap-1'>
                      <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14' />
                      </svg>
                      Order
                    </div>
                  </th>
                  <th scope='col' className='relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6'>
                    Actions
                  </th>
                </tr>
              </thead>
              <SortableContext items={filteredContents.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {filteredContents.map((item) => (
                    <SortableRow key={item.id} item={item} onDelete={handleDelete} />
                  ))}
                </tbody>
              </SortableContext>
            </table>
            {!filteredContents.length && (
              <div className='py-12 text-center'>
                <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  {selectedSection === 'all' ? 'No content blocks found' : `No ${SECTION_LABELS[selectedSection as Section]} content found`}
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  {selectedSection === 'all'
                    ? 'Get started by creating your first content block.'
                    : `Create a ${SECTION_LABELS[selectedSection as Section]} content block to get started.`
                  }
                </p>
                <div className='mt-6'>
                  <Link
                    href='/backoffice/about-us/new'
                    className='inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                  >
                    <PlusIcon className='-ml-1 mr-2 h-5 w-5' aria-hidden='true' />
                    Add Content Block
                  </Link>
                </div>
              </div>
            )}
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
