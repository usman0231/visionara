'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Setting {
  id: string;
  key: string;
  value: Record<string, any>;
}

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  setting?: Setting | null;
}

interface SettingFormData {
  key: string;
  value: string;
}

const settingTemplates = [
  {
    name: 'Site General',
    key: 'site.general',
    value: {
      title: 'Visionara',
      description: 'Professional web development services',
      email: 'contact@visionara.com',
      phone: '+1 234 567 8900',
      address: '123 Business St, City, State 12345'
    }
  },
  {
    name: 'Features Toggle',
    key: 'features.enabled',
    value: {
      darkMode: true,
      analytics: true,
      chatWidget: false,
      maintenance: false,
      newsletter: true
    }
  },
  {
    name: 'Social Links',
    key: 'social.links',
    value: {
      twitter: 'https://twitter.com/visionara',
      linkedin: 'https://linkedin.com/company/visionara',
      github: 'https://github.com/visionara',
      instagram: 'https://instagram.com/visionara'
    }
  },
  {
    name: 'API Configuration',
    key: 'api.limits',
    value: {
      maxRequests: 1000,
      rateLimitWindow: '1h',
      allowedOrigins: ['localhost', 'visionara.com'],
      timeout: 30000
    }
  }
];

export default function SettingModal({ isOpen, onClose, onSave, setting }: SettingModalProps) {
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SettingFormData>({
    key: '',
    value: '',
  });

  useEffect(() => {
    if (setting) {
      setFormData({
        key: setting.key,
        value: JSON.stringify(setting.value, null, 2),
      });
    } else {
      setFormData({
        key: '',
        value: '',
      });
    }
    setJsonError(null);
  }, [setting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON
    let parsedValue;
    try {
      parsedValue = JSON.parse(formData.value);
    } catch (error) {
      setJsonError('Invalid JSON format');
      return;
    }

    setLoading(true);
    setJsonError(null);

    try {
      const url = setting
        ? `/api/admin/settings/${setting.id}`
        : '/api/admin/settings';

      const response = await fetch(url, {
        method: setting ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: formData.key,
          value: parsedValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save setting');
      }

      onSave();
    } catch (error: any) {
      // Better error handling - log error instead of alert
      console.error('Error saving setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SettingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear JSON error when user starts typing in value field
    if (field === 'value' && jsonError) {
      setJsonError(null);
    }
  };

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const useTemplate = (template: typeof settingTemplates[0]) => {
    setFormData({
      key: template.key,
      value: JSON.stringify(template.value, null, 2),
    });
    setJsonError(null);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(formData.value);
      const formatted = JSON.stringify(parsed, null, 2);
      handleInputChange('value', formatted);
    } catch (error) {
      // JSON is invalid, don't format
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {setting ? 'Edit Setting' : 'Add New Setting'}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Templates (only show when creating new setting) */}
                {!setting && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Start Templates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {settingTemplates.map((template) => (
                        <button
                          key={template.key}
                          type="button"
                          onClick={() => useTemplate(template)}
                          className="text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-1">{template.key}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                      Setting Key *
                    </label>
                    <input
                      type="text"
                      id="key"
                      required
                      value={formData.key}
                      onChange={(e) => handleInputChange('key', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                      placeholder="e.g. site.general, features.enabled"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use dot notation for hierarchical keys (e.g., site.general, api.limits)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                        JSON Value *
                      </label>
                      <button
                        type="button"
                        onClick={formatJson}
                        className="text-xs text-indigo-600 hover:text-indigo-900"
                      >
                        Format JSON
                      </button>
                    </div>
                    <textarea
                      id="value"
                      required
                      rows={12}
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      onBlur={(e) => validateJson(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm font-mono ${
                        jsonError
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-indigo-500'
                      }`}
                      placeholder={`{
  "key": "value",
  "number": 123,
  "boolean": true,
  "array": ["item1", "item2"],
  "nested": {
    "property": "value"
  }
}`}
                    />
                    {jsonError && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {jsonError}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Enter valid JSON. Use double quotes for strings, no trailing commas.
                    </p>
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
                      disabled={loading || !!jsonError || !formData.value.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      {!jsonError && formData.value.trim() && (
                        <CheckIcon className="h-4 w-4" />
                      )}
                      {loading ? 'Saving...' : (setting ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>

                {/* JSON Validation Tips */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">JSON Tips:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Use double quotes for strings: "key": "value"</li>
                    <li>• Numbers don't need quotes: "count": 123</li>
                    <li>• Booleans: true or false (no quotes)</li>
                    <li>• Arrays: ["item1", "item2"]</li>
                    <li>• No trailing commas after the last item</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}