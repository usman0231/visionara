'use client';

import { useState, useEffect, Suspense } from 'react';
import { PhotoIcon, PlusIcon, PencilIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GalleryModal from '@/components/backoffice/GalleryModal';
import PageHeader from '@/components/backoffice/PageHeader';
import ToggleSwitch from '@/components/backoffice/ToggleSwitch';
import { useNotification } from '@/components/backoffice/NotificationProvider';
import { useDragAndDrop } from '@/components/backoffice/useDragAndDrop';

interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

// Sortable Gallery Item Component
function SortableGalleryItem({
  item,
  onEdit,
  onDelete
}: {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/10 ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}
    >
      <div className="aspect-square relative bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjAgODBIMTQwVjEyMEg2MFY4MFoiIGZpbGw9IiNENUQ3REEiLz48Y2lyY2xlIGN4PSI4NSIgY3k9Ijk1IiByPSI1IiBmaWxsPSIjOUI5QjlCIi8+PHBhdGggZD0iTTExMCAxMDVMMTI1IDkwTDE0MCAxMDVWMTIwSDExMFYxMDVaIiBmaWxsPSIjRDVEN0RBIi8+PC9zdmc+';
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <TrashIcon className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
        {!item.active && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-md bg-gray-100/90 px-2 py-1 text-xs font-medium text-gray-600">
              Inactive
            </span>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className="inline-flex items-center rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
            #{item.sortOrder}
          </span>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing hover:bg-white"
        >
          <Bars3Icon className="h-4 w-4 text-gray-600" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={item.alt}>
          {item.alt}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize drag and drop hook
  const { handleDragEnd, isReordering } = useDragAndDrop({
    items,
    setItems,
    updateEndpoint: '/api/admin/gallery'
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      if (!response.ok) {
        setItems([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setItems(data);
    } catch (error: any) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete gallery item');
      await fetchGalleryItems();
      showNotification('Gallery item deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete gallery item: ' + error.message, 'error');
    }
  };

  const openModal = (item?: GalleryItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSaveItem = async () => {
    await fetchGalleryItems();
    closeModal();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const response = await fetch(`/api/admin/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    // Update local state immediately for better UX
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, active: !currentActive } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Gallery"
        description="Manage your portfolio images and media content that showcases your work."
        icon={
          <PhotoIcon className="h-6 w-6" />
        }
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        action={{
          label: "Add Image",
          onClick: () => openModal(),
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      {/* Enhanced Instructions */}
      <div className="mt-8 mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Gallery Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              Switch between grid and list view below. Use the toggle switches in list view to publish/hide images instantly. In grid view, drag images to reorder them.
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="flex justify-between items-center">
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 text-sm font-medium rounded-l-md border transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Grid {viewMode === 'grid' && '(Drag to reorder)'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-b border-r transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            List
          </button>
        </div>
        {isReordering && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            Updating order...
          </div>
        )}
      </div>

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
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Images</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{items.length}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Active Images</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {items.filter(item => item.active).length}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Recent Uploads</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {items.filter(item => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(item.createdAt) > weekAgo;
              }).length}
            </dd>
          </div>
        </div>
      </Suspense>

      <Suspense fallback={
        <div className="mt-8">
          <div className="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      }>
        <div className="mt-8">
        {viewMode === 'grid' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
              <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                isReordering ? 'pointer-events-none' : ''
              }`}>
                {items.map((item) => (
                  <SortableGalleryItem
                    key={item.id}
                    item={item}
                    onEdit={openModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Image
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Alt Text
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Order
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.alt}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMjAgMjZINDRWMzhIMjBWMjZaIiBmaWxsPSIjRDVEN0RBIi8+PGNpcmNsZSBjeD0iMjgiIGN5PSIzMCIgcj0iMiIgZmlsbD0iIzlCOUI5QiIvPjxwYXRoIGQ9Ik0zNCAzNEwzOCAzMEw0NCAzNFYzOEgzNFYzNFoiIGZpbGw9IiNENUQ3REEiLz48L3N2Zz4=';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={item.alt}>
                        {item.alt}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <ToggleSwitch
                        enabled={item.active}
                        onChange={() => {}} // Handled by onToggle
                        onToggle={(newValue) => handleToggleActive(item.id, item.active)}
                        showNotification={showNotification}
                        successMessage={item.active ? 'Image hidden from gallery' : 'Image published to gallery'}
                        size="sm"
                        title={item.active ? 'Published - Click to hide' : 'Hidden - Click to publish'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {item.sortOrder}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit {item.alt}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete {item.alt}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No images</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first image.</p>
            <div className="mt-6">
              <button
                onClick={() => openModal()}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add Image
              </button>
            </div>
          </div>
        )}
        </div>
      </Suspense>

      <GalleryModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveItem} item={editingItem} />
    </div>
  );
}