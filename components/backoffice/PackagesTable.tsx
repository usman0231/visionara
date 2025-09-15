'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
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

interface Package {
  id: string;
  category: 'Web' | 'Mobile' | 'Graphic' | 'Marketing';
  tier: 'Basic' | 'Standard' | 'Enterprise';
  priceOnetime: string;
  priceMonthly: string;
  priceYearly: string;
  features: string[];
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

const categoryColors = {
  Web: 'bg-blue-100 text-blue-800',
  Mobile: 'bg-green-100 text-green-800',
  Graphic: 'bg-purple-100 text-purple-800',
  Marketing: 'bg-orange-100 text-orange-800'
};

const tierColors = {
  Basic: 'bg-gray-100 text-gray-800',
  Standard: 'bg-yellow-100 text-yellow-800',
  Enterprise: 'bg-red-100 text-red-800'
};

interface SortableRowProps {
  pkg: Package;
  onDelete: (id: string) => void;
}

function SortableRow({ pkg, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
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
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${categoryColors[pkg.category]}`}>
                {pkg.category}
              </span>
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${tierColors[pkg.tier]}`}>
                {pkg.tier}
              </span>
            </div>
            <span className="font-medium">{pkg.category} {pkg.tier}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        <div className="space-y-1">
          <div><span className="text-gray-400">One-time:</span> {pkg.priceOnetime}</div>
          <div><span className="text-gray-400">Monthly:</span> {pkg.priceMonthly}</div>
          <div><span className="text-gray-400">Yearly:</span> {pkg.priceYearly}</div>
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-gray-500">
        <div className="max-w-xs">
          <div className="text-xs text-gray-400 mb-1">{pkg.features.length} features</div>
          <div className="space-y-0.5">
            {pkg.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="truncate text-xs">{feature}</div>
            ))}
            {pkg.features.length > 3 && (
              <div className="text-xs text-gray-400">+{pkg.features.length - 3} more</div>
            )}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
          pkg.active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {pkg.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        #{pkg.sortOrder}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/backoffice/packages/${pkg.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit {pkg.category} {pkg.tier}</span>
          </Link>
          <button
            onClick={() => onDelete(pkg.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete {pkg.category} {pkg.tier}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PackagesTable() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (!response.ok) {
        setPackages([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setPackages(data);
    } catch (error: any) {
      setPackages([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete package');

      await fetchPackages();
    } catch (error: any) {
      console.error('Failed to delete package:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsReordering(true);

    const filteredPackages = selectedCategory === 'all'
      ? packages
      : packages.filter(pkg => pkg.category === selectedCategory);

    const oldIndex = filteredPackages.findIndex((pkg) => pkg.id === active.id);
    const newIndex = filteredPackages.findIndex((pkg) => pkg.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPackages = arrayMove(filteredPackages, oldIndex, newIndex);

      // Update sort orders based on new positions
      const updatedPackages = reorderedPackages.map((pkg, index) => ({
        ...pkg,
        sortOrder: index + 1
      }));

      // Update local state immediately for smooth UX
      const allPackagesWithUpdates = packages.map(pkg => {
        const updated = updatedPackages.find(u => u.id === pkg.id);
        return updated || pkg;
      });
      setPackages(allPackagesWithUpdates);

      // Send updates to the server
      try {
        await Promise.all(
          updatedPackages.map((pkg) =>
            fetch(`/api/admin/packages/${pkg.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...pkg,
                sortOrder: pkg.sortOrder
              }),
            })
          )
        );
      } catch (error) {
        console.error('Failed to update sort orders:', error);
        // Optionally revert the changes or show an error message
        await fetchPackages();
      }
    }

    setIsReordering(false);
  };

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(pkg => pkg.category === selectedCategory);

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
          {['Web', 'Mobile', 'Graphic', 'Marketing'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? categoryColors[category as keyof typeof categoryColors]
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
                        Package
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Pricing
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Features
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
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
                  items={filteredPackages.map(pkg => pkg.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPackages.map((pkg) => (
                      <SortableRow key={pkg.id} pkg={pkg} onDelete={handleDelete} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
              {filteredPackages.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">
                    {selectedCategory === 'all' ? 'No packages found' : `No ${selectedCategory} packages found`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}