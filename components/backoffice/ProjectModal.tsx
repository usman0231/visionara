'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ServiceInfo {
  id: string;
  title: string;
}

interface ProjectImage {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  serviceId: string | null;
  coverImage: string;
  priority: number;
  active: boolean;
  service?: ServiceInfo | null;
  images?: ProjectImage[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project?: Project | null;
  services: ServiceInfo[];
}

interface ProjectFormData {
  title: string;
  description: string;
  serviceId: string | null;
  coverImage: string;
  priority: number;
  active: boolean;
}

interface UploadProgress {
  total: number;
  completed: number;
  current: string;
}

export default function ProjectModal({ isOpen, onClose, onSave, project, services }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    serviceId: null,
    coverImage: '',
    priority: 0,
    active: true,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        serviceId: project.serviceId,
        coverImage: project.coverImage,
        priority: project.priority,
        active: project.active,
      });
      setImages(project.images || []);
    } else {
      setFormData({
        title: '',
        description: '',
        serviceId: null,
        coverImage: '',
        priority: 0,
        active: true,
      });
      setImages([]);
    }
    setError(null);
    setUploadProgress(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';

      const response = await fetch(url, {
        method: project ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project');
      }

      onSave();
    } catch (error: any) {
      setError(error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Upload single file
  const uploadFile = async (file: File): Promise<string | null> => {
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
    return url;
  };

  // Handle cover image upload
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadFile(file);
      if (url) {
        handleInputChange('coverImage', url);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload cover image');
    } finally {
      setUploading(false);
    }
  };

  // Handle multiple gallery images upload
  const handleMultipleGalleryUpload = useCallback(async (files: FileList | File[]) => {
    if (!project) {
      setError('Please save the project first before adding gallery images');
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length === 0) {
      setError('No valid image files selected. Max 10MB per image.');
      return;
    }

    setUploadProgress({ total: validFiles.length, completed: 0, current: validFiles[0].name });
    setError(null);

    const newImages: ProjectImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({ total: validFiles.length, completed: i, current: file.name });

      try {
        const url = await uploadFile(file);
        if (url) {
          // Add image to project
          const imgResponse = await fetch(`/api/admin/projects/${project.id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: url,
              alt: file.name.split('.')[0].replace(/[-_]/g, ' '),
              sortOrder: images.length + newImages.length,
            }),
          });

          if (imgResponse.ok) {
            const newImage = await imgResponse.json();
            newImages.push(newImage);
          }
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploadProgress(null);
  }, [project, images.length]);

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/project-images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleGalleryUpload(e.dataTransfer.files);
    }
  }, [handleMultipleGalleryUpload]);

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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {project ? 'Edit Project' : 'Add New Project'}
                  </Dialog.Title>
                  <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Project Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      {/* Service */}
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
                          <option value="">All Services (No category)</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Priority and Active */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                            Priority (lower = higher rank)
                          </label>
                          <input
                            type="number"
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
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
                    </div>

                    {/* Right Column - Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Image *
                      </label>
                      {formData.coverImage ? (
                        <div className="relative">
                          <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={formData.coverImage}
                              alt="Cover preview"
                              fill
                              className="object-cover"
                              sizes="400px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleInputChange('coverImage', '')}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-gray-400 aspect-video flex items-center justify-center">
                          {uploading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                            </div>
                          ) : (
                            <div>
                              <PhotoIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                                className="hidden"
                                id="cover-upload"
                              />
                              <label
                                htmlFor="cover-upload"
                                className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                              >
                                <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                                Upload Cover
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                      <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => handleInputChange('coverImage', e.target.value)}
                        placeholder="Or enter image URL..."
                        className="mt-2 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Gallery Images Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Gallery Images ({images.length})
                      </label>
                      {project && (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => e.target.files && handleMultipleGalleryUpload(e.target.files)}
                            className="hidden"
                            id="gallery-upload-multiple"
                          />
                          <label
                            htmlFor="gallery-upload-multiple"
                            className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Images
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress && (
                      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-indigo-700">
                            Uploading: {uploadProgress.current}
                          </span>
                          <span className="text-sm text-indigo-600 font-medium">
                            {uploadProgress.completed + 1} / {uploadProgress.total}
                          </span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((uploadProgress.completed + 1) / uploadProgress.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {project ? (
                      <>
                        {/* Drag and Drop Zone */}
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
                            dragActive
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center py-4">
                            <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Drag & drop multiple images here, or use the &quot;Add Images&quot; button
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max 10MB per image. JPG, PNG, GIF, WebP supported.
                            </p>
                          </div>
                        </div>

                        {/* Images Grid */}
                        {images.length > 0 && (
                          <div className="grid grid-cols-5 gap-2">
                            {images.map((img, index) => (
                              <div key={img.id} className="relative group">
                                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={img.imageUrl}
                                    alt={img.alt}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">
                                    #{index + 1}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {images.length === 0 && !uploadProgress && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No gallery images yet. Add images by dragging or clicking &quot;Add Images&quot;.
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Save the project first, then edit it to add gallery images.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploading || uploadProgress !== null || !formData.coverImage || !formData.title}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
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
