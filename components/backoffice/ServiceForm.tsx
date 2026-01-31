'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';

const serviceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  text: z.string().min(1, 'Text is required'),
  iconUrl: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().url('Icon URL must be a valid URL').optional()
  ),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: ServiceFormData & { id: string };
}

type IconMode = 'none' | 'upload' | 'url';

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [iconMode, setIconMode] = useState<IconMode>('none');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      title: '',
      text: '',
      iconUrl: '',
      active: true,
      sortOrder: 0,
    },
  });

  const watchIconUrl = watch('iconUrl');

  // Initialize icon mode based on existing service data
  useEffect(() => {
    if (service) {
      reset(service);
      if (service.iconUrl) {
        // Check if it's an uploaded file (local path or blob URL)
        if (service.iconUrl.startsWith('/uploads/') || service.iconUrl.includes('blob.vercel-storage.com')) {
          setIconMode('upload');
          setUploadedUrl(service.iconUrl);
        } else {
          setIconMode('url');
        }
      } else {
        setIconMode('none');
      }
    }
  }, [service, reset]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (GIF, PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('File size must be less than 4MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      // Check content type to avoid parsing HTML as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Upload failed. Please try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setValue('iconUrl', data.url);
      setUploadedUrl(data.url);
      setIconMode('upload');
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeIcon = () => {
    setValue('iconUrl', '');
    setUploadedUrl(null);
    setIconMode('none');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchToUrlMode = () => {
    setIconMode('url');
    setUploadedUrl(null);
    setValue('iconUrl', '');
  };

  const switchToUploadMode = () => {
    setIconMode('none');
    setValue('iconUrl', '');
  };

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Clean the data
      const filteredData = {
        ...data,
        iconUrl: data.iconUrl || undefined,
      };

      const url = service ? `/api/services/${service.id}` : '/api/services';
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save service');
      }

      router.push('/backoffice/services');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('title')}
                  placeholder="Enter service title"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                />
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  min="0"
                  {...register('sortOrder', { valueAsNumber: true })}
                  placeholder="0"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm"
                />
              </div>
              {errors.sortOrder && (
                <p className="mt-2 text-sm text-red-600">{errors.sortOrder.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Icon <span className="text-gray-400 font-normal">(Optional)</span>
              </label>

              {/* No icon selected - show options */}
              {iconMode === 'none' && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No icon selected</p>
                    <div className="mt-4 flex justify-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gif,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="icon-upload"
                      />
                      <label
                        htmlFor="icon-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 cursor-pointer transition-colors ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={switchToUrlMode}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Use URL
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      PNG, JPG, JPEG, or GIF (max 4MB)
                    </p>
                  </div>
                </div>
              )}

              {/* Uploaded image - show preview with remove option */}
              {iconMode === 'upload' && uploadedUrl && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                      <Image
                        src={uploadedUrl}
                        alt="Uploaded icon"
                        fill
                        className="object-contain p-2"
                        onError={() => {
                          setUploadedUrl(null);
                          setIconMode('none');
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Uploaded Image</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{uploadedUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* URL mode - show input with preview */}
              {iconMode === 'url' && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="relative w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {watchIconUrl ? (
                        <Image
                          src={watchIconUrl}
                          alt="Icon preview"
                          fill
                          className="object-contain p-2"
                          onError={() => {}}
                        />
                      ) : (
                        <LinkIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    {/* URL Input */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon URL
                      </label>
                      <input
                        type="text"
                        {...register('iconUrl')}
                        placeholder="https://example.com/icon.png"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 text-sm"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={switchToUploadMode}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                          Upload Instead
                        </button>
                        <button
                          type="button"
                          onClick={removeIcon}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.iconUrl && (
                <p className="mt-2 text-sm text-red-600">{errors.iconUrl.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <div className="mt-1">
                <textarea
                  rows={5}
                  {...register('text')}
                  placeholder="Enter service description..."
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-400 sm:text-sm resize-y min-h-[120px]"
                />
              </div>
              {errors.text && (
                <p className="mt-2 text-sm text-red-600">{errors.text.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <input
                  id="active"
                  type="checkbox"
                  {...register('active')}
                  className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="active" className="block text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Active (Service will be visible on the website)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : service ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
}