'use client';

import { useState, useEffect } from 'react';
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
  meta: Record<string, any>;
  createdAt: string;
}

type SortField = 'createdAt' | 'name' | 'email' | 'serviceType';
type SortDirection = 'asc' | 'desc';

const serviceTypes = ['Web Development', 'Mobile App', 'Graphic Design', 'Marketing', 'Other'];
const budgetRanges = ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+'];
const timelineOptions = ['ASAP', '1-2 weeks', '1-2 months', '3-6 months', '6+ months'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      if (!response.ok) {
        // If API fails, show empty state instead of error
        setContacts([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setContacts(data);
    } catch (error: any) {
      // On any error, show empty state
      setContacts([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete contact');

      await fetchContacts();
    } catch (error: any) {
      alert('Failed to delete contact: ' + error.message);
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-xl font-semibold text-gray-900">Contact Submissions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and respond to customer inquiries and lead submissions
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={exportContacts}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowDownTrayIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Export CSV
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

      {/* Filters */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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

      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
        contact={selectedContact}
      />
    </div>
  );
}