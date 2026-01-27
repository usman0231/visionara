'use client';

import { useState, useEffect } from 'react';
import {
  CogIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface Settings {
  id?: string;
  email: string;
  phone: string;
  address: string;
  workHours: string;
  officeHours: string;
  facebook: string;
  instagram: string;
  twitter: string;
  github: string;
  threads: string;
  linkedin: string;
}

const DEFAULT_SETTINGS: Settings = {
  email: '',
  phone: '',
  address: '',
  workHours: '',
  officeHours: '',
  facebook: '',
  instagram: '',
  twitter: '',
  github: '',
  threads: '',
  linkedin: ''
};

const SETTINGS_KEY = 'site.settings';

export default function SettingsPage() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editValues, setEditValues] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        const allSettings = Array.isArray(data) ? data : data.settings || [];
        const siteSetting = allSettings.find((s: any) => s.key === SETTINGS_KEY);

        if (siteSetting) {
          setSettingId(siteSetting.id);
          const values = { ...DEFAULT_SETTINGS, ...siteSetting.value };
          setSettings(values);
          setEditValues(values);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditValues({ ...settings });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditValues({ ...settings });
    setEditing(false);
  };

  const handleChange = (field: keyof Settings, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      let response;

      if (settingId) {
        // Update existing
        response = await fetch(`/api/admin/settings/${settingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: SETTINGS_KEY, value: editValues }),
        });
      } else {
        // Create new
        response = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: SETTINGS_KEY, value: editValues }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (!settingId && data.id) {
          setSettingId(data.id);
        }
        setSettings({ ...editValues });
        setEditing(false);
        showNotification('Settings saved successfully', 'success');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <PageHeader
        title="Settings"
        description="Manage your website settings"
        icon={<CogIcon className="h-6 w-6" />}
        iconBgColor="bg-gray-100"
        iconColor="text-gray-600"
      />

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Site Settings</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <EnvelopeIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                label="Email"
                value={editing ? editValues.email : settings.email}
                onChange={(v) => handleChange('email', v)}
                editing={editing}
                type="email"
                icon={<EnvelopeIcon className="h-4 w-4" />}
              />
              <SettingField
                label="Phone"
                value={editing ? editValues.phone : settings.phone}
                onChange={(v) => handleChange('phone', v)}
                editing={editing}
                icon={<PhoneIcon className="h-4 w-4" />}
              />
              <SettingField
                label="Address"
                value={editing ? editValues.address : settings.address}
                onChange={(v) => handleChange('address', v)}
                editing={editing}
                type="textarea"
                icon={<MapPinIcon className="h-4 w-4" />}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Hours</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                label="Work Hours"
                value={editing ? editValues.workHours : settings.workHours}
                onChange={(v) => handleChange('workHours', v)}
                editing={editing}
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
              <SettingField
                label="Office Hours"
                value={editing ? editValues.officeHours : settings.officeHours}
                onChange={(v) => handleChange('officeHours', v)}
                editing={editing}
                placeholder="e.g., By Appointment Only"
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Social Media Links</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField
                label="Facebook"
                value={editing ? editValues.facebook : settings.facebook}
                onChange={(v) => handleChange('facebook', v)}
                editing={editing}
                type="url"
                placeholder="https://facebook.com/..."
              />
              <SettingField
                label="Instagram"
                value={editing ? editValues.instagram : settings.instagram}
                onChange={(v) => handleChange('instagram', v)}
                editing={editing}
                type="url"
                placeholder="https://instagram.com/..."
              />
              <SettingField
                label="X (Twitter)"
                value={editing ? editValues.twitter : settings.twitter}
                onChange={(v) => handleChange('twitter', v)}
                editing={editing}
                type="url"
                placeholder="https://x.com/..."
              />
              <SettingField
                label="GitHub"
                value={editing ? editValues.github : settings.github}
                onChange={(v) => handleChange('github', v)}
                editing={editing}
                type="url"
                placeholder="https://github.com/..."
              />
              <SettingField
                label="Threads"
                value={editing ? editValues.threads : settings.threads}
                onChange={(v) => handleChange('threads', v)}
                editing={editing}
                type="url"
                placeholder="https://threads.net/..."
              />
              <SettingField
                label="LinkedIn"
                value={editing ? editValues.linkedin : settings.linkedin}
                onChange={(v) => handleChange('linkedin', v)}
                editing={editing}
                type="url"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  type?: 'text' | 'email' | 'url' | 'textarea';
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

function SettingField({
  label,
  value,
  onChange,
  editing,
  type = 'text',
  placeholder,
  icon,
  className = ''
}: SettingFieldProps) {
  if (editing) {
    if (type === 'textarea') {
      return (
        <div className={className}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      );
    }

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-900">
        {value || <span className="text-gray-400 italic">Not set</span>}
      </div>
    </div>
  );
}
