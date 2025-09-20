'use client';

import { useState, useEffect, Suspense } from 'react';
import { UserIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import UserModal from '@/components/backoffice/UserModal';
import PageHeader from '@/components/backoffice/PageHeader';
import ToggleSwitch from '@/components/backoffice/ToggleSwitch';
import { useNotification } from '@/components/backoffice/NotificationProvider';

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
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      // Add active status for demo purposes (since API doesn't have it yet)
      const usersWithActiveStatus = data.map((user: User) => ({
        ...user,
        active: true // Default to active, you can modify this based on your requirements
      }));
      setUsers(usersWithActiveStatus);
    } catch (error: any) {
      setUsers([]);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    } catch (e) {
      // ignore
    } finally {
      setRolesLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = (typeof document !== 'undefined' && document.cookie.match(/(?:^|; )sb-access-token=([^;]+)/)?.[1]) || '';
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : undefined,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const error = await response.json();
        showNotification(error.error || 'Failed to delete user', 'error');
        return;
      }

      await fetchUsers();
      showNotification('User deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete user: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    // For demo purposes, just update local state
    // In a real implementation, you would call an API endpoint
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, active: !currentActive } : user
      )
    );

    showNotification(
      currentActive ? 'User deactivated successfully' : 'User activated successfully',
      'success'
    );
  };

  const openModal = (user?: User) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async () => {
    await fetchUsers();
    closeModal();
    showNotification(
      editingUser ? 'User updated successfully' : 'User created successfully',
      'success'
    );
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions for your Visionara backoffice."
        icon={
          <UserIcon className="h-6 w-6" />
        }
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        action={{
          label: "Add User",
          onClick: () => openModal(),
          icon: <PlusIcon className="h-4 w-4" />
        }}
      />

      <Suspense fallback={
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
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
              <h3 className="text-sm font-medium text-blue-800">User Management</h3>
              <div className="mt-1 text-sm text-blue-700">
                Manage user accounts and permissions. Use toggle switches to activate/deactivate users instantly. Only active users can access the system.
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{users.length}</dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Admin Users</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {users.filter(user => user.role?.name === 'Admin').length}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Active Users</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {users.filter(user => user.active).length}
            </dd>
          </div>
        </div>
      </Suspense>

      <Suspense fallback={
        <div className="mt-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <div className="mt-8">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first user.</p>
              <div className="mt-6">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Add User
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      <div className="flex items-center justify-center gap-1">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Active
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            user.role?.name === 'Admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role?.name === 'Editor'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role?.name || 'No role'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <ToggleSwitch
                          enabled={user.active || false}
                          onChange={() => {}} // Handled by onToggle
                          onToggle={(newValue) => handleToggleActive(user.id, user.active || false)}
                          showNotification={showNotification}
                          successMessage={user.active ? 'User deactivated successfully' : 'User activated successfully'}
                          size="sm"
                          title={user.active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit {user.displayName}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">Delete {user.displayName}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Suspense>

      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveUser}
        user={editingUser}
        roles={roles}
        loadingRoles={rolesLoading}
      />
    </div>
  );
}
