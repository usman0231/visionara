'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import { PhotoIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CloudArrowUpIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Image from 'next/image';
import PageHeader from '@/components/backoffice/PageHeader';
import ToggleSwitch from '@/components/backoffice/ToggleSwitch';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface ServiceInfo {
  id: string;
  title: string;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  alt: string;
  sortOrder: number;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  serviceId: string | null;
  coverImage: string;
  priority: number;
  active: boolean;
  createdAt: string;
  service?: ServiceInfo | null;
  images?: ProductImage[];
}

interface ProductFormData {
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

export default function GalleryPage() {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterServiceId, setFilterServiceId] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  // Filter products
  const filteredProducts = filterServiceId
    ? products.filter(p => p.serviceId === filterServiceId)
    : products;

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
      showNotification('Product deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete product: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });

    if (!response.ok) throw new Error('Failed to update status');

    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, active: !currentActive } : product
      )
    );
  };

  const handleTogglePriority = async (id: string, currentPriority: number) => {
    const newPriority = currentPriority === 0 ? 1 : 0;
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority }),
    });

    if (!response.ok) throw new Error('Failed to update priority');

    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, priority: newPriority } : product
      )
    );
    showNotification(newPriority === 0 ? 'Marked as featured' : 'Removed from featured', 'success');
  };

  const openModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    await fetchProducts();
    closeModal();
  };

  const openPreview = (product: Product) => {
    setPreviewProduct(product);
    setPreviewImageIndex(0);
  };

  const getAllImages = (product: Product): { url: string; alt: string }[] => {
    const allImages: { url: string; alt: string }[] = [
      { url: product.coverImage, alt: product.title }
    ];
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        allImages.push({ url: img.imageUrl, alt: img.alt });
      });
    }
    return allImages;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Product Gallery"
        description="Manage your portfolio products. Each product can have multiple images."
        icon={<PhotoIcon className="h-6 w-6" />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        action={{
          label: "Add Product",
          onClick: () => openModal(),
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      {/* Instructions */}
      <div className="mt-8 mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Product Gallery Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              Create products with cover image and multiple gallery images. Star icon marks featured products. Max 8 products shown per category on frontend.
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="serviceFilter" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="serviceFilter"
            value={filterServiceId}
            onChange={(e) => setFilterServiceId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="">All Categories</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span>Total: <strong>{products.length}</strong></span>
          <span>Active: <strong>{products.filter(p => p.active).length}</strong></span>
          <span>Featured: <strong>{products.filter(p => p.priority === 0).length}</strong></span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Cover Image */}
            <div className="aspect-[4/3] relative bg-gray-100">
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openPreview(product)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      title="Preview"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => openModal(product)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {!product.active && (
                  <span className="inline-flex items-center rounded-md bg-gray-100/90 px-2 py-1 text-xs font-medium text-gray-600">
                    Inactive
                  </span>
                )}
                {product.service && (
                  <span className="inline-flex items-center rounded-md bg-indigo-500/90 px-2 py-1 text-xs font-medium text-white">
                    {product.service.title}
                  </span>
                )}
              </div>

              {/* Image Count */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md">
                <PhotoIcon className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-medium text-white">
                  {(product.images?.length || 0) + 1}
                </span>
              </div>

              {/* Priority Star */}
              <button
                onClick={() => handleTogglePriority(product.id, product.priority)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm"
                title={product.priority === 0 ? 'Featured - Click to unfeature' : 'Click to mark as featured'}
              >
                {product.priority === 0 ? (
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate" title={product.title}>
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{product.description}</p>
                  )}
                </div>
                <ToggleSwitch
                  enabled={product.active}
                  onChange={() => {}}
                  onToggle={() => handleToggleActive(product.id, product.active)}
                  showNotification={showNotification}
                  successMessage={product.active ? 'Product hidden' : 'Product published'}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {filterServiceId ? 'No products in this category' : 'No products yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first product.
          </p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        product={editingProduct}
        services={services}
      />

      {/* Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setPreviewProduct(null)}>
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300" onClick={() => setPreviewProduct(null)}>
            ✕
          </button>

          {getAllImages(previewProduct).length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImageIndex(prev => (prev - 1 + getAllImages(previewProduct).length) % getAllImages(previewProduct).length);
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImageIndex(prev => (prev + 1) % getAllImages(previewProduct).length);
                }}
              >
                ›
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={getAllImages(previewProduct)[previewImageIndex]?.url}
              alt={getAllImages(previewProduct)[previewImageIndex]?.alt}
              width={1200}
              height={800}
              className="object-contain max-h-[70vh] w-auto"
            />
            <div className="text-center mt-4">
              <h3 className="text-white text-lg font-semibold">{previewProduct.title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {previewImageIndex + 1} / {getAllImages(previewProduct).length}
              </p>
              {/* Thumbnails */}
              {getAllImages(previewProduct).length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {getAllImages(previewProduct).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                        idx === previewImageIndex ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    >
                      <Image src={img.url} alt={img.alt} width={48} height={48} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pending image for new products (before save)
interface PendingImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

// Product Modal Component
function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  services
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product?: Product | null;
  services: ServiceInfo[];
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    serviceId: null,
    coverImage: '',
    priority: 1,
    active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || '',
        serviceId: product.serviceId,
        coverImage: product.coverImage,
        priority: product.priority,
        active: product.active,
      });
      setImages(product.images || []);
      setPendingImages([]);
    } else {
      setFormData({
        title: '',
        description: '',
        serviceId: null,
        coverImage: '',
        priority: 1,
        active: true,
      });
      setImages([]);
      setPendingImages([]);
    }
    setError(null);
    setUploadProgress(null);
  }, [product, isOpen]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [pendingImages]);

  const uploadFile = async (file: File): Promise<string | null> => {
    // Client-side validation before upload (Vercel has 4.5MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      throw new Error(`Image "${file.name}" is too large. Maximum size is 4MB.`);
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      // Handle Vercel's payload too large error
      if (response.status === 413) {
        throw new Error(`Image "${file.name}" is too large. Maximum size is 4MB.`);
      }

      if (!response.ok) {
        // Try to get JSON error, but handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        } else {
          // Non-JSON response (like Vercel error page)
          throw new Error('Failed to upload image. The file may be too large.');
        }
      }

      const { url } = await response.json();
      return url;
    } catch (err: any) {
      // Re-throw our custom errors
      if (err.message) {
        throw err;
      }
      // Handle network errors
      throw new Error('Network error. Please check your connection and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For new products with pending images
      if (!product && pendingImages.length > 0) {
        const coverImg = pendingImages.find(img => img.isCover);
        const galleryImgs = pendingImages.filter(img => !img.isCover);

        // Upload all images first
        setUploadProgress({ total: pendingImages.length, completed: 0, current: coverImg?.file.name || '' });

        // Upload cover image
        let coverUrl = formData.coverImage;
        if (coverImg) {
          coverUrl = await uploadFile(coverImg.file) || '';
        }

        if (!coverUrl) {
          throw new Error('Cover image is required');
        }

        // Create the product
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, coverImage: coverUrl }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save product');
        }

        const newProduct = await response.json();

        // Upload gallery images
        const failedGalleryUploads: string[] = [];
        for (let i = 0; i < galleryImgs.length; i++) {
          const img = galleryImgs[i];
          setUploadProgress({ total: pendingImages.length, completed: i + 1, current: img.file.name });

          try {
            const url = await uploadFile(img.file);
            if (url) {
              await fetch(`/api/admin/projects/${newProduct.id}/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageUrl: url,
                  alt: img.file.name.split('.')[0].replace(/[-_]/g, ' '),
                  sortOrder: i,
                }),
              });
            }
          } catch (err: any) {
            console.error(`Failed to upload gallery image ${img.file.name}:`, err);
            failedGalleryUploads.push(img.file.name);
          }
        }

        setUploadProgress(null);

        // Show warning for failed gallery uploads but still close modal (product was created)
        if (failedGalleryUploads.length > 0) {
          alert(`Product created, but some images failed to upload: ${failedGalleryUploads.join(', ')}. You can add them later by editing the product.`);
        }

        onSave();
        return;
      }

      // For existing products or products without pending images
      const url = product
        ? `/api/admin/projects/${product.id}`
        : '/api/admin/projects';

      const response = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      onSave();
    } catch (error: any) {
      setError(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle adding multiple images for new products
  const handleAddPendingImages = useCallback((files: FileList | File[]) => {
    const maxSize = 4 * 1024 * 1024; // 4MB (Vercel limit)
    const tooLargeFiles: string[] = [];
    const invalidTypeFiles: string[] = [];

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        invalidTypeFiles.push(file.name);
        return false;
      }
      if (file.size > maxSize) {
        tooLargeFiles.push(file.name);
        return false;
      }
      return true;
    });

    // Show specific error messages
    if (tooLargeFiles.length > 0) {
      setError(`These images are too large (max 4MB): ${tooLargeFiles.join(', ')}`);
      if (validFiles.length === 0) return;
    }
    if (invalidTypeFiles.length > 0 && validFiles.length === 0) {
      setError('Selected files are not valid images.');
      return;
    }

    const newPendingImages: PendingImage[] = validFiles.map((file, index) => ({
      id: `pending-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: pendingImages.length === 0 && index === 0, // First image is cover by default
    }));

    setPendingImages(prev => [...prev, ...newPendingImages]);
    setError(null);
  }, [pendingImages.length]);

  const handleRemovePendingImage = (id: string) => {
    setPendingImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // If we removed the cover, make the first remaining image the cover
      if (updated.length > 0 && !updated.some(img => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const handleSetCover = (id: string) => {
    setPendingImages(prev => prev.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  const handleMultipleGalleryUpload = useCallback(async (files: FileList | File[]) => {
    if (!product) {
      // For new products, add to pending images
      handleAddPendingImages(files);
      return;
    }

    const maxSize = 4 * 1024 * 1024; // 4MB (Vercel limit)
    const tooLargeFiles: string[] = [];

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > maxSize) {
        tooLargeFiles.push(file.name);
        return false;
      }
      return true;
    });

    if (tooLargeFiles.length > 0) {
      setError(`These images are too large (max 4MB): ${tooLargeFiles.join(', ')}`);
      if (validFiles.length === 0) return;
    }

    if (validFiles.length === 0) {
      setError('No valid image files selected.');
      return;
    }

    setUploadProgress({ total: validFiles.length, completed: 0, current: validFiles[0].name });
    setError(null);

    const newImages: ProductImage[] = [];
    const failedUploads: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress({ total: validFiles.length, completed: i, current: file.name });

      try {
        const url = await uploadFile(file);
        if (url) {
          const imgResponse = await fetch(`/api/admin/projects/${product.id}/images`, {
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
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error);
        failedUploads.push(file.name);
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploadProgress(null);

    // Show error for failed uploads
    if (failedUploads.length > 0) {
      setError(`Failed to upload: ${failedUploads.join(', ')}`);
    }
  }, [product, images.length, handleAddPendingImages]);

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

  // Check if we have a valid cover (either uploaded URL or pending cover image)
  const hasCover = formData.coverImage || pendingImages.some(img => img.isCover);

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {product ? 'Edit Product' : 'Add New Product'}
                  </Dialog.Title>
                  <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter product name"
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
                        placeholder="Product description (optional)"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <select
                        id="serviceId"
                        value={formData.serviceId || ''}
                        onChange={(e) => handleInputChange('serviceId', e.target.value || null)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Category</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority & Active */}
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.priority === 0}
                          onChange={(e) => handleInputChange('priority', e.target.checked ? 0 : 1)}
                          className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <StarIconSolid className="h-4 w-4 text-yellow-500" />
                          Featured Product
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  {/* Images Section - Unified for both new and existing products */}
                  <div className="border-t pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Product Images *</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product
                            ? `${images.length + 1} image${images.length !== 0 ? 's' : ''} (1 cover + ${images.length} gallery)`
                            : `${pendingImages.length} image${pendingImages.length !== 1 ? 's' : ''} selected`
                          }
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => e.target.files && handleMultipleGalleryUpload(e.target.files)}
                          className="hidden"
                          id="images-upload"
                        />
                        <label
                          htmlFor="images-upload"
                          className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Images
                        </label>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress && (
                      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-indigo-700">Uploading: {uploadProgress.current}</span>
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

                    {/* Drag & Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 mb-4 transition-colors ${
                        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center py-3">
                        <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag & drop images here, or click &quot;Add Images&quot; button
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          First image will be used as cover
                        </p>
                      </div>
                    </div>

                    {/* For Existing Products - Show cover + gallery images */}
                    {product && (
                      <div className="space-y-4">
                        {/* Cover Image */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Cover Image</p>
                          <div className="inline-block relative group">
                            <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100 ring-2 ring-indigo-500">
                              <Image src={formData.coverImage} alt="Cover" fill className="object-cover" sizes="128px" />
                              <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                COVER
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Gallery Images */}
                        {images.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Gallery Images</p>
                            <div className="grid grid-cols-6 gap-2">
                              {images.map((img, index) => (
                                <div key={img.id} className="relative group">
                                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                                    <Image src={img.imageUrl} alt={img.alt} fill className="object-cover" sizes="80px" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center">
                                      #{index + 1}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  >
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* For New Products - Show pending images */}
                    {!product && pendingImages.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Selected Images (click star to set as cover)
                        </p>
                        <div className="grid grid-cols-5 gap-3">
                          {pendingImages.map((img, index) => (
                            <div key={img.id} className="relative group">
                              <div className={`aspect-square relative rounded-lg overflow-hidden bg-gray-100 ${
                                img.isCover ? 'ring-2 ring-indigo-500' : ''
                              }`}>
                                <Image src={img.preview} alt={`Image ${index + 1}`} fill className="object-cover" sizes="100px" />
                                {img.isCover && (
                                  <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    COVER
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center truncate">
                                  {img.file.name}
                                </div>
                              </div>
                              {/* Set as cover button */}
                              {!img.isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(img.id)}
                                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                                  title="Set as cover"
                                >
                                  <StarIcon className="h-3.5 w-3.5 text-gray-500" />
                                </button>
                              )}
                              {img.isCover && (
                                <div className="absolute top-1 right-1 p-1 bg-yellow-400 rounded-full shadow-sm">
                                  <StarIconSolid className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemovePendingImage(img.id)}
                                className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state for new products */}
                    {!product && pendingImages.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No images selected. Upload at least one image for the cover.
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
                      disabled={loading || uploading || uploadProgress !== null || !hasCover || !formData.title}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? (uploadProgress ? 'Uploading Images...' : 'Saving...') : (product ? 'Update Product' : 'Create Product')}
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
