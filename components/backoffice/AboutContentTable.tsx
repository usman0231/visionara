'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
    <tr ref={setNodeRef} style={style} className={isDragging ? 'bg-gray-50 shadow-lg' : undefined}>
      <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='cursor-grab text-gray-400 transition hover:text-gray-600'
            aria-label='Drag to reorder'
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className='h-5 w-5' />
          </button>
          <div className='flex flex-col gap-1'>
            <span className={`inline-flex w-fit rounded-full px-2 text-xs font-semibold leading-5 ${SECTION_BADGES[item.section]}`}>
              {SECTION_LABELS[item.section]}
            </span>
            <span className='font-medium'>{item.title}</span>
            {item.subtitle && <span className='text-sm text-gray-500'>{item.subtitle}</span>}
          </div>
        </div>
      </td>
      <td className='px-3 py-4 text-sm text-gray-500'>
        <div className='max-w-xs truncate' title={preview}>
          {preview || '--'}
        </div>
      </td>
      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>#{item.sortOrder}</td>
      <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
        <div className='flex items-center justify-end gap-2'>
          <Link href={`/backoffice/about-us/${item.id}`} className='text-indigo-600 transition hover:text-indigo-900'>
            <PencilIcon className='h-4 w-4' />
            <span className='sr-only'>Edit {item.title}</span>
          </Link>
          <button type='button' onClick={() => onDelete(item.id)} className='text-red-600 transition hover:text-red-900'>
            <TrashIcon className='h-4 w-4' />
            <span className='sr-only'>Delete {item.title}</span>
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
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => {
            setSelectedSection('all');
            setError(null);
          }}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedSection === 'all'
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedSection === section
                ? SECTION_BADGES[section as Section]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
        {isReordering && (
          <div className='flex items-center gap-2 text-sm text-indigo-600'>
            <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-indigo-600' />
            Updating order...
          </div>
        )}
      </div>

      {error && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
            <div className='overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th scope='col' className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                      <div className='flex items-center gap-2'>
                        <Bars3Icon className='h-4 w-4 text-gray-400' />
                        Content Block
                      </div>
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      Preview
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      Status
                    </th>
                    <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      Order
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
                <div className='py-12 text-center text-sm text-gray-500'>
                  {selectedSection === 'all'
                    ? 'No content blocks found yet.'
                    : `No ${SECTION_LABELS[selectedSection as Section]} content found.`}
                </div>
              )}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
