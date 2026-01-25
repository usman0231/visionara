'use client';

import { useState, useEffect } from 'react';
import {
  CogIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  GlobeAltIcon,
  LinkIcon,
  BellIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface Setting {
  id: string;
  key: string;
  value: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Predefined setting categories for better organization
const SETTING_CATEGORIES = {
  'site': {
    label: 'Site Info',
    icon: GlobeAltIcon,
    color: 'bg-blue-100 text-blue-600',
    description: 'Basic site information'
  },
  'contact': {
    label: 'Contact',
    icon: EnvelopeIcon,
    color: 'bg-green-100 text-green-600',
    description: 'Contact information'
  },
  'social': {
    label: 'Social Media',
    icon: LinkIcon,
    color: 'bg-purple-100 text-purple-600',
    description: 'Social media links'
  },
  'features': {
    label: 'Features',
    icon: ShieldCheckIcon,
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Feature toggles'
  },
  'notifications': {
    label: 'Notifications',
    icon: BellIcon,
    color: 'bg-red-100 text-red-600',
    description: 'Notification settings'
  },
  'other': {
    label: 'Other',
    icon: CogIcon,
    color: 'bg-gray-100 text-gray-600',
    description: 'Other settings'
  },
};

// Quick templates for common settings
const QUICK_TEMPLATES = [
  {
    key: 'site.info',
    label: 'Site Information',
    icon: GlobeAltIcon,
    fields: [
      { name: 'siteName', label: 'Site Name', type: 'text', default: 'Visionara' },
      { name: 'tagline', label: 'Tagline', type: 'text', default: 'Digital Excellence' },
      { name: 'description', label: 'Description', type: 'textarea', default: '' },
    ]
  },
  {
    key: 'contact.info',
    label: 'Contact Information',
    icon: PhoneIcon,
    fields: [
      { name: 'email', label: 'Email', type: 'email', default: '' },
      { name: 'phone', label: 'Phone', type: 'text', default: '' },
      { name: 'address', label: 'Address', type: 'textarea', default: '' },
      { name: 'contactHours', label: 'Contact Hours', type: 'text', default: '24/7' },
      { name: 'officeHours', label: 'Office Hours', type: 'text', default: 'Appointment Only' },
    ]
  },
  {
    key: 'social.links',
    label: 'Social Media Links',
    icon: LinkIcon,
    fields: [
      { name: 'facebook', label: 'Facebook URL', type: 'url', default: '' },
      { name: 'twitter', label: 'Twitter/X URL', type: 'url', default: '' },
      { name: 'instagram', label: 'Instagram URL', type: 'url', default: '' },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'url', default: '' },
      { name: 'github', label: 'GitHub URL', type: 'url', default: '' },
    ]
  },
  {
    key: 'features.toggles',
    label: 'Feature Toggles',
    icon: ShieldCheckIcon,
    fields: [
      { name: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean', default: false },
      { name: 'showNewsletter', label: 'Show Newsletter', type: 'boolean', default: true },
      { name: 'enableChat', label: 'Enable Chat Widget', type: 'boolean', default: false },
    ]
  },
];

export default function SettingsPage() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof QUICK_TEMPLATES[0] | null>(null);
  const [newSettingValues, setNewSettingValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(Array.isArray(data) ? data : data.settings || []);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (key: string) => {
    const prefix = key.split('.')[0];
    return SETTING_CATEGORIES[prefix as keyof typeof SETTING_CATEGORIES] || SETTING_CATEGORIES.other;
  };

  const startEditing = (setting: Setting) => {
    setEditingKey(setting.key);
    setEditValues(setting.value);
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValues({});
  };

  const saveSetting = async (setting: Setting) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${setting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: setting.key, value: editValues }),
      });

      if (response.ok) {
        showNotification('Setting saved successfully', 'success');
        await fetchSettings();
        cancelEditing();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showNotification('Failed to save setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      const response = await fetch(`/api/admin/settings/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('Setting deleted', 'success');
        await fetchSettings();
      }
    } catch (error) {
      showNotification('Failed to delete setting', 'error');
    }
  };

  const openAddModal = (template: typeof QUICK_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    const defaults: Record<string, any> = {};
    template.fields.forEach(f => { defaults[f.name] = f.default; });
    setNewSettingValues(defaults);
    setShowAddModal(true);
  };

  const createSetting = async () => {
    if (!selectedTemplate) return;
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedTemplate.key, value: newSettingValues }),
      });

      if (response.ok) {
        showNotification('Setting created successfully', 'success');
        await fetchSettings();
        setShowAddModal(false);
        setSelectedTemplate(null);
        setNewSettingValues({});
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create');
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to create setting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (
    fieldName: string,
    value: any,
    onChange: (name: string, val: any) => void,
    type: string = 'text',
    label?: string
  ) => {
    if (type === 'boolean' || typeof value === 'boolean') {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(fieldName, e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
            </div>
          </div>
          <span className="text-sm text-gray-700">{label || fieldName}</span>
        </label>
      );
    }

    if (type === 'textarea') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label || fieldName}</label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(fieldName, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label || fieldName}</label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>
    );
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const prefix = setting.key.split('.')[0];
    const category = SETTING_CATEGORIES[prefix as keyof typeof SETTING_CATEGORIES] ? prefix : 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>);

  // Check which templates are already created
  const existingKeys = new Set(settings.map(s => s.key));

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <PageHeader
        title="Settings"
        description="Manage your website settings and configuration"
        icon={<CogIcon className="h-6 w-6" />}
        iconBgColor="bg-gray-100"
        iconColor="text-gray-600"
      />

      {/* Quick Add Section */}
      {QUICK_TEMPLATES.some(t => !existingKeys.has(t.key)) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_TEMPLATES.filter(t => !existingKeys.has(t.key)).map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.key}
                  onClick={() => openAddModal(template)}
                  className="flex items-center gap-3 p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 group-hover:text-indigo-600">{template.label}</div>
                    <div className="text-xs text-gray-500">Click to add</div>
                  </div>
                  <PlusIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-indigo-600" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings List */}
      {Object.keys(groupedSettings).length > 0 ? (
        <div className="mt-8 space-y-8">
          {Object.entries(groupedSettings).map(([categoryKey, categorySettings]) => {
            const category = SETTING_CATEGORIES[categoryKey as keyof typeof SETTING_CATEGORIES] || SETTING_CATEGORIES.other;
            const Icon = category.icon;

            return (
              <div key={categoryKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{category.label}</h2>
                </div>

                <div className="space-y-4">
                  {categorySettings.map((setting) => {
                    const isEditing = editingKey === setting.key;
                    const template = QUICK_TEMPLATES.find(t => t.key === setting.key);

                    return (
                      <div
                        key={setting.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="px-6 py-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {template?.label || setting.key}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Key: <code className="bg-gray-100 px-1 rounded">{setting.key}</code>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveSetting(setting)}
                                    disabled={saving}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    <CheckIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(setting)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <PencilSquareIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => deleteSetting(setting.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {template ? (
                              // Render with template fields
                              template.fields.map((field) => (
                                <div key={field.name}>
                                  {renderFieldInput(
                                    field.name,
                                    isEditing ? editValues[field.name] : setting.value[field.name],
                                    isEditing
                                      ? (name, val) => setEditValues(prev => ({ ...prev, [name]: val }))
                                      : () => {},
                                    field.type,
                                    field.label
                                  )}
                                  {!isEditing && (
                                    <div className="mt-1 text-sm text-gray-600">
                                      {typeof setting.value[field.name] === 'boolean'
                                        ? (setting.value[field.name] ? 'Enabled' : 'Disabled')
                                        : setting.value[field.name] || <span className="text-gray-400 italic">Not set</span>}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              // Render raw JSON values
                              Object.entries(setting.value).map(([key, val]) => (
                                <div key={key}>
                                  {isEditing ? (
                                    renderFieldInput(
                                      key,
                                      editValues[key],
                                      (name, v) => setEditValues(prev => ({ ...prev, [name]: v })),
                                      typeof val === 'boolean' ? 'boolean' : 'text',
                                      key
                                    )
                                  ) : (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                                      <div className="text-sm text-gray-600">
                                        {typeof val === 'boolean'
                                          ? (val ? 'Enabled' : 'Disabled')
                                          : typeof val === 'object'
                                            ? JSON.stringify(val)
                                            : val || <span className="text-gray-400 italic">Not set</span>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                          Last updated: {new Date(setting.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 text-lg font-medium text-gray-900">No settings yet</h3>
          <p className="mt-1 text-gray-500">Get started by adding your first setting using the Quick Setup above.</p>
        </div>
      )}

      {/* Add Setting Modal */}
      {showAddModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <selectedTemplate.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.label}</h3>
                  <p className="text-sm text-gray-500">Configure your {selectedTemplate.label.toLowerCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.name}>
                    {renderFieldInput(
                      field.name,
                      newSettingValues[field.name],
                      (name, val) => setNewSettingValues(prev => ({ ...prev, [name]: val })),
                      field.type,
                      field.label
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createSetting}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Setting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
