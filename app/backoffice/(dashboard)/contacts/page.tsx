'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import ContactModal from '@/components/backoffice/ContactModal';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  serviceType: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  status: 'unseen' | 'seen' | 'replied' | 'archived';
  replyMessage: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'createdAt' | 'name' | 'email' | 'serviceType';
type SortDirection = 'asc' | 'desc';

const serviceTypes = ['Web Development', 'Mobile App', 'Graphic Design', 'Marketing', 'Other'];
const budgetRanges = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+'];
const timelineOptions = ['ASAP', '1-2 weeks', '1-2 months', '3-6 months', '6+ months'];

export default function ContactsPage() {
  const { showNotification } = useNotification();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, []);

  // Real-time polling - fetch every 10 seconds
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchContacts(true); // Pass true to indicate it's a background refresh
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled]);

  const fetchContacts = async (isBackgroundRefresh = false) => {
    try {
      const response = await fetch('/api/admin/contact-submissions');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        if (!isBackgroundRefresh) {
          setContacts([]);
          setLoading(false);
        }
        return;
      }
      const data = await response.json();

      // Check for new contacts if this is a background refresh
      if (isBackgroundRefresh && contacts.length > 0) {
        const newContacts = data.filter((newContact: ContactSubmission) =>
          !contacts.some(existingContact => existingContact.id === newContact.id)
        );

        if (newContacts.length > 0) {
          showNotification(
            `${newContacts.length} new contact${newContacts.length > 1 ? 's' : ''} received!`,
            'success'
          );
        }
      }

      setContacts(data);
      setLastFetchTime(new Date());
    } catch (error: any) {
      // On any error, show empty state
      if (!isBackgroundRefresh) {
        setContacts([]);
        setError(null);
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contact');

      await fetchContacts();
      showNotification('Contact deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete contact: ' + error.message, 'error');
    }
  };

  const openModal = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setIsModalOpen(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportContacts = () => {
    const csv = [
      'Name,Email,Company,Phone,Service Type,Budget,Timeline,Message,Created At',
      ...filteredAndSortedContacts.map(contact => [
        contact.name,
        contact.email,
        contact.company || '',
        contact.phone || '',
        contact.serviceType || '',
        contact.budget || '',
        contact.timeline || '',
        `"${contact.message.replace(/"/g, '""')}"`,
        new Date(contact.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and sort logic
  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const matchesSearch = !searchTerm ||
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService = !serviceFilter || contact.serviceType === serviceFilter;
      const matchesBudget = !budgetFilter || contact.budget === budgetFilter;

      let matchesDate = true;
      if (dateFilter) {
        const contactDate = new Date(contact.createdAt);
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            matchesDate = contactDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = contactDate > weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = contactDate > monthAgo;
            break;
        }
      }

      return matchesSearch && matchesService && matchesBudget && matchesDate;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'serviceType':
          aValue = a.serviceType || '';
          bValue = b.serviceType || '';
          break;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        }>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Suspense>
      </div>
    );
  }

  // Remove error display - we show empty state instead

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Contact Submissions"
        description="Manage and respond to customer inquiries and lead submissions from your website."
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        action={{
          label: "Export CSV",
          onClick: exportContacts,
          icon: <ArrowDownTrayIcon className="h-4 w-4" />
        }}
      />

      {/* Real-time Status Bar */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isAutoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isAutoRefreshEnabled ? 'Live updates enabled' : 'Live updates paused'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Last updated: {lastFetchTime.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchContacts()}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isAutoRefreshEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutoRefreshEnabled ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Contacts</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{contacts.length}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">This Week</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {contacts.filter(c => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(c.createdAt) > weekAgo;
            }).length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Web Projects</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {contacts.filter(c => c.serviceType === 'Web Development').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">High Budget</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {contacts.filter(c => c.budget && (c.budget.includes('$15,000') || c.budget.includes('$50,000+'))).length}
          </dd>
        </div>
      </div>

      {/* Enhanced Filter Section matching About Us pattern */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-900">Filter Contacts</h3>
          </div>
          <span className="text-xs text-gray-500">
            {filteredAndSortedContacts.length} of {contacts.length} contacts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
            />
          </div>

          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
            >
              <option value="">All Services</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
            >
              <option value="">All Budgets</option>
              {budgetRanges.map(budget => (
                <option key={budget} value={budget}>{budget}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setSearchTerm('');
                setServiceFilter('');
                setBudgetFilter('');
                setDateFilter('');
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Instructions */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Contact Management</h3>
            <div className="mt-1 text-sm text-blue-700">
              Click on the eye icon to view full contact details and messages. Use filters to find specific contacts quickly.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }>
          {/* Contacts Table */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                Contact {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('serviceType')}
              >
                Service {sortField === 'serviceType' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Budget & Timeline
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredAndSortedContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      {contact.company && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-900">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                        <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:text-indigo-900">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {contact.serviceType && (
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      {contact.serviceType}
                    </span>
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {contact.budget && (
                      <div className="text-sm">{contact.budget}</div>
                    )}
                    {contact.timeline && (
                      <div className="text-xs text-gray-400">{contact.timeline}</div>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(contact)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="sr-only">View {contact.name}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete {contact.name}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
            </table>

            {filteredAndSortedContacts.length === 0 && (
              <div className="py-12 text-center">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  {contacts.length === 0 ? 'No contacts yet' : 'No matches found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {contacts.length === 0
                    ? 'Customer inquiries will appear here when they submit the contact form.'
                    : 'Try adjusting your filters to find what you\'re looking for.'
                  }
                </p>
              </div>
            )}
          </div>
        </Suspense>
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contact={selectedContact}
        onReplySuccess={() => {
          fetchContacts();
          showNotification('Reply sent successfully!', 'success');
        }}
      />
    </div>
  );
}