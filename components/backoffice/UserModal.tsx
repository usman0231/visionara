'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  displayName: string | null;
  roleId: string;
  role?: Role;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
  roles?: Role[];
  loadingRoles?: boolean;
}

export default function UserModal({ isOpen, onClose, onSave, user, roles: rolesProp, loadingRoles: loadingRolesProp }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    roleId: '',
    password: '',
  });
  const [roles, setRoles] = useState<Role[]>(rolesProp || []);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(!!loadingRolesProp);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (rolesProp && rolesProp.length > 0) {
        setRoles(rolesProp);
        setRolesLoading(!!loadingRolesProp);
      } else {
        // Fallback: fetch roles if not provided by parent
        fetchRoles();
      }
      if (user) {
        setFormData({
          email: user.email,
          displayName: user.displayName || '',
          roleId: user.roleId,
          password: '',
        });
      } else {
        setFormData({
          email: '',
          displayName: '',
          roleId: '',
          password: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, user, rolesProp, loadingRolesProp]);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = user
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users';

      const method = user ? 'PUT' : 'POST';

      const token = (typeof document !== 'undefined' && document.cookie.match(/(?:^|; )sb-access-token=([^;]+)/)?.[1]) || '';
      const payload = user
        ? { email: formData.email, displayName: formData.displayName, roleId: formData.roleId, ...(formData.password ? { password: formData.password } : {}) }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'SOFT_DELETED') {
          // Offer to restore the user
          if (confirm('A user with this email exists (possibly deleted). Restore this user?')) {
            try {
              const token = (typeof document !== 'undefined' && document.cookie.match(/(?:^|; )sb-access-token=([^;]+)/)?.[1]) || '';
              const restoreRes = await fetch('/api/admin/users/restore', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email: formData.email, displayName: formData.displayName, roleId: formData.roleId, password: formData.password || undefined }),
              });
              if (restoreRes.ok) {
                onSave();
                return;
              }
            } catch {}
          }
        }
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((detail: any) => {
            if (detail.path && detail.message) {
              fieldErrors[detail.path[0]] = detail.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: errorData.error || 'An error occurred' });
        }
        return;
      }

      onSave();
    } catch (error) {
      setErrors({ general: 'Failed to save user' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {user ? 'Edit User' : 'Create New User'}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-gray-500">
                      Add or update a user’s basic details and role.
                    </p>

                    {errors.general && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {errors.general}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      {/* Skeleton during initial load */}
                      {rolesLoading && (
                        <div className="space-y-4">
                          <div className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm">
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-28"></div>
                              <div className="h-9 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-32 mt-3"></div>
                              <div className="h-9 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                          <div className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm">
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-9 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {!rolesLoading && (
                        <>
                          <div className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm space-y-4">
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm ${
                                  errors.email ? 'ring-red-300' : ''
                                }`}
                                placeholder="user@example.com"
                                required
                              />
                              {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                                Display Name
                              </label>
                              <input
                                type="text"
                                id="displayName"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm ${
                                  errors.displayName ? 'ring-red-300' : ''
                                }`}
                                placeholder="John Doe"
                                required
                              />
                              {errors.displayName && (
                                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {user ? 'Set New Password (optional)' : 'Password'}
                              </label>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm ${
                                  errors.password ? 'ring-red-300' : ''
                                }`}
                                placeholder={user ? 'Leave blank to keep unchanged' : 'Set a password (min 8 characters)'}
                                required={!user}
                              />
                              {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm">
                            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                              Role
                            </label>
                            <select
                              id="roleId"
                              name="roleId"
                              value={formData.roleId}
                              onChange={handleChange}
                              className={`mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm ${
                                errors.roleId ? 'ring-red-300' : ''
                              }`}
                              required
                            >
                              <option value="">Select a role</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Choose the user’s permission level.</p>
                            {errors.roleId && (
                              <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
                            )}
                          </div>
                        </>
                      )}

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading || rolesLoading}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
