'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ServiceInfo {
  id: string;
  title: string;
}

interface GalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
  serviceId: string | null;
  active: boolean;
  sortOrder: number;
  service?: ServiceInfo | null;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: GalleryItem | null;
}

interface GalleryFormData {
  imageUrl: string;
  alt: string;
  serviceId: string | null;
  active: boolean;
  sortOrder: number;
}

export default function GalleryModal({ isOpen, onClose, onSave, item }: GalleryModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [formData, setFormData] = useState<GalleryFormData>({
    imageUrl: '',
    alt: '',
    serviceId: null,
    active: true,
    sortOrder: 0,
  });

  // Fetch services for dropdown
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        imageUrl: item.imageUrl,
        alt: item.alt,
        serviceId: item.serviceId || null,
        active: item.active,
        sortOrder: item.sortOrder,
      });
    } else {
      setFormData({
        imageUrl: '',
        alt: '',
        serviceId: null,
        active: true,
        sortOrder: 0,
      });
    }
    // Clear errors when modal opens
    setError(null);
    setUploadError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = item
        ? `/api/admin/gallery/${item.id}`
        : '/api/admin/gallery';

      const response = await fetch(url, {
        method: item ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save gallery item');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving gallery item:', error);
      setError(error.message || 'Failed to save gallery item');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GalleryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { url } = await response.json();
      handleInputChange('imageUrl', url);

      // Auto-generate alt text from filename if empty
      if (!formData.alt) {
        const filename = file.name.split('.')[0];
        const altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        handleInputChange('alt', altText);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {item ? 'Edit Gallery Item' : 'Add New Image'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Messages */}
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{uploadError}</div>
                    </div>
                  )}

                  {/* Image Upload/Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>

                    {formData.imageUrl ? (
                      <div className="relative">
                        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={formData.imageUrl}
                            alt={formData.alt || 'Preview'}
                            fill
                            className="object-cover"
                            sizes="400px"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInputChange('imageUrl', '')}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {uploading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                Drag and drop an image here, or click to select
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileInput}
                                className="hidden"
                                id="file-upload"
                              />
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              >
                                <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                                Select Image
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Manual URL input */}
                    <div className="mt-2">
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        placeholder="Or enter image URL..."
                        className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
                      Alt Text *
                    </label>
                    <input
                      type="text"
                      id="alt"
                      required
                      value={formData.alt}
                      onChange={(e) => handleInputChange('alt', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
                      Service Category
                    </label>
                    <select
                      id="serviceId"
                      value={formData.serviceId || ''}
                      onChange={(e) => handleInputChange('serviceId', e.target.value || null)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">All Services (No specific category)</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a service to categorize this image, or leave empty for general gallery.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        id="sortOrder"
                        value={formData.sortOrder}
                        onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                        className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        id="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploading || !formData.imageUrl}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}