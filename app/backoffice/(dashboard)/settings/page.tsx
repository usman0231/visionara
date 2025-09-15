'use client';

import { useState, useEffect } from 'react';
import { CogIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import SettingModal from '@/components/backoffice/SettingModal';

interface Setting {
  id: string;
  key: string;
  value: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [expandedSettings, setExpandedSettings] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        setSettings([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setSettings(data);
    } catch (error: any) {
      // On any error, show empty state
      setSettings([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      const response = await fetch(`/api/admin/settings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete setting');

      await fetchSettings();
    } catch (error: any) {
      alert('Failed to delete setting: ' + error.message);
    }
  };

  const openModal = (setting?: Setting) => {
    setEditingSetting(setting || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingSetting(null);
    setIsModalOpen(false);
  };

  const handleSaveSetting = async () => {
    await fetchSettings();
    closeModal();
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedSettings);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSettings(newExpanded);
  };

  const renderJsonValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (typeof value === 'boolean') return <span className="text-blue-600">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-green-600">{value}</span>;
    if (typeof value === 'string') return <span className="text-orange-600">"{value}"</span>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-500">[]</span>;
      return (
        <div className={depth > 0 ? 'ml-4' : ''}>
          <span className="text-gray-500">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderJsonValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return <span className="text-gray-500">{'{}'}</span>;

      return (
        <div className={depth > 0 ? 'ml-4' : ''}>
          <span className="text-gray-500">{'{'}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600">"{key}"</span>
              <span className="text-gray-500">: </span>
              {renderJsonValue(value[key], depth + 1)}
              {index < keys.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">{'}'}</span>
        </div>
      );
    }

    return <span className="text-gray-400">{String(value)}</span>;
  };

  const filteredSettings = settings.filter(setting =>
    setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(setting.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Remove error display - we show empty state instead

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage application settings and configuration values
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Setting
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Settings Cards */}
      <div className="mt-6 space-y-4">
        {filteredSettings.map((setting) => (
          <div key={setting.id} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleExpanded(setting.id)}
                      className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      {expandedSettings.has(setting.id) ? (
                        <ChevronDownIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 mr-1" />
                      )}
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {setting.key}
                      </code>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Created: {new Date(setting.createdAt).toLocaleString()} •
                    Updated: {new Date(setting.updatedAt).toLocaleString()}
                  </div>

                  {expandedSettings.has(setting.id) ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
                        {renderJsonValue(setting.value)}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-mono text-sm text-gray-600 truncate">
                        {JSON.stringify(setting.value)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => openModal(setting)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="sr-only">Edit {setting.key}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="sr-only">Delete {setting.key}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSettings.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No settings</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first setting.</p>
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Setting
            </button>
          </div>
        </div>
      )}

      {filteredSettings.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No settings found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Common Settings Templates */}
      {settings.length === 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Common Settings Examples:</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-xs text-gray-600 mb-2">site.general</div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`{
  "title": "Visionara",
  "description": "Professional web development services",
  "email": "contact@visionara.com",
  "phone": "+1 234 567 8900"
}`}
              </pre>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-xs text-gray-600 mb-2">features.enabled</div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`{
  "darkMode": true,
  "analytics": true,
  "chatWidget": false,
  "maintenance": false
}`}
              </pre>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-xs text-gray-600 mb-2">social.links</div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`{
  "twitter": "https://twitter.com/visionara",
  "linkedin": "https://linkedin.com/company/visionara",
  "github": "https://github.com/visionara"
}`}
              </pre>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-mono text-xs text-gray-600 mb-2">api.limits</div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`{
  "maxRequests": 1000,
  "rateLimitWindow": "1h",
  "allowedOrigins": ["localhost", "visionara.com"]
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      <SettingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSetting}
        setting={editingSetting}
      />
    </div>
  );
}