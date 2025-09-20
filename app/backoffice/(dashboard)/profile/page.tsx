'use client';

import { useState, useEffect, Suspense } from 'react';
import { UserIcon, KeyIcon, EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  verificationCode: string;
}

export default function ProfilePage() {
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingDisplayName, setSubmittingDisplayName] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/me');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setDisplayName(data.displayName || '');
    } catch (error: any) {
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameSave = async () => {
    if (!displayName.trim()) {
      showNotification('Display name cannot be empty', 'error');
      return;
    }

    setSubmittingDisplayName(true);
    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update display name');
      }

      await fetchProfile();
      setEditingDisplayName(false);
      showNotification('Display name updated successfully', 'success');

      // Emit custom event to update sidebar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user:profile-updated'));
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setSubmittingDisplayName(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!passwordForm.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' });
      return;
    }

    try {
      const response = await fetch('/api/profile/password/request-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request password change');
      }

      const data = await response.json();
      setVerificationSent(true);
      showNotification('Verification code sent to your email', 'success');

      // In development, show the verification code
      if (data.verificationCode) {
        console.log('🔐 Verification code (development):', data.verificationCode);
        showNotification(`Development code: ${data.verificationCode}`, 'success');
      }
    } catch (error: any) {
      setPasswordErrors({ currentPassword: error.message });
    }
  };

  const handlePasswordChange = async () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!passwordForm.verificationCode) {
      errors.verificationCode = 'Verification code is required';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSubmittingPassword(true);
    try {
      const response = await fetch('/api/profile/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationCode: passwordForm.verificationCode,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        verificationCode: ''
      });
      setPasswordErrors({});
      setShowPasswordForm(false);
      setVerificationSent(false);
      showNotification('Password changed successfully', 'success');
    } catch (error: any) {
      setPasswordErrors({ verificationCode: error.message });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handlePasswordFormChange = (field: keyof PasswordChangeForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Unable to load profile</h3>
          <p className="mt-1 text-sm text-gray-500">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="My Profile"
        description="Manage your account settings, display name, and password."
        icon={<UserIcon className="h-6 w-6" />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <Suspense fallback={
        <div className="mt-8 space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      }>
        {/* Enhanced Instructions */}
        <div className="mt-8 mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Profile Management</h3>
              <div className="mt-1 text-sm text-blue-700">
                Update your display name and change your password. Password changes require email verification for security.
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Profile Information</h3>

            <div className="space-y-6">
              {/* User Avatar & Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Role</div>
                  <div className="text-lg font-medium text-gray-900">{profile.role?.name || 'No role'}</div>
                  <div className="text-sm text-gray-500">Member since {new Date(profile.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{profile.email}</span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Cannot be changed
                  </span>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <div className="mt-1">
                  {editingDisplayName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter your display name"
                      />
                      <button
                        onClick={handleDisplayNameSave}
                        disabled={submittingDisplayName}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {submittingDisplayName ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingDisplayName(false);
                          setDisplayName(profile.displayName || '');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">
                        {profile.displayName || 'No display name set'}
                      </span>
                      <button
                        onClick={() => setEditingDisplayName(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Password & Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Change your password to keep your account secure.
                </p>
              </div>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {showPasswordForm && (
              <div className="border-t pt-4">
                <div className="space-y-4">
                  {!verificationSent ? (
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                        className={`mt-1 block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          passwordErrors.currentPassword ? 'border-red-300' : ''
                        }`}
                        placeholder="Enter your current password"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={handleRequestPasswordChange}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Send Verification Code
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                              verificationCode: ''
                            });
                            setPasswordErrors({});
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                              Verification code sent to {profile.email}
                            </p>
                            <p className="mt-1 text-sm text-green-700">
                              Please check your email and enter the verification code below.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          id="verificationCode"
                          value={passwordForm.verificationCode}
                          onChange={(e) => handlePasswordFormChange('verificationCode', e.target.value)}
                          className={`mt-1 block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            passwordErrors.verificationCode ? 'border-red-300' : ''
                          }`}
                          placeholder="Enter verification code"
                        />
                        {passwordErrors.verificationCode && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.verificationCode}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                          className={`mt-1 block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            passwordErrors.newPassword ? 'border-red-300' : ''
                          }`}
                          placeholder="Enter new password (min 8 characters)"
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                          className={`mt-1 block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                            passwordErrors.confirmPassword ? 'border-red-300' : ''
                          }`}
                          placeholder="Confirm new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handlePasswordChange}
                          disabled={submittingPassword}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {submittingPassword ? 'Changing Password...' : 'Change Password'}
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setVerificationSent(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                              verificationCode: ''
                            });
                            setPasswordErrors({});
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  );
}