'use client';

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/backoffice/PageHeader';
import { useNotification } from '@/components/backoffice/NotificationProvider';

interface NewsletterSubscription {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'email' | 'subscribedAt' | 'status';
type SortDirection = 'asc' | 'desc';

export default function NewsletterPage() {
  const { showNotification } = useNotification();
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [sortField, setSortField] = useState<SortField>('subscribedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/newsletter?${params.toString()}`);
      if (!response.ok) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setSubscriptions(data);
    } catch (error: any) {
      setSubscriptions([]);
      showNotification('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subscription');

      await fetchSubscriptions();
      showNotification('Subscription deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete subscription: ' + error.message, 'error');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/newsletter/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Subscriptions exported successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to export subscriptions: ' + error.message, 'error');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = () => {
    fetchSubscriptions();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTimeout(() => fetchSubscriptions(), 100);
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = [...subscriptions]
    .filter(sub => {
      if (!searchTerm) return true;
      return sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'subscribedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const stats = {
    total: subscriptions.length,
    subscribed: subscriptions.filter(s => s.status === 'subscribed').length,
    unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
  };

  return (
    <div className="newsletter-page">
      <PageHeader
        title="Newsletter Subscriptions"
        description="Manage and export your newsletter subscriber list"
        icon={<EnvelopeIcon className="h-6 w-6" />}
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <EnvelopeIcon className="stat-icon" />
          <div>
            <p className="stat-label">Total Subscriptions</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card stat-card--success">
          <CheckCircleIcon className="stat-icon" />
          <div>
            <p className="stat-label">Active Subscribers</p>
            <p className="stat-value">{stats.subscribed}</p>
          </div>
        </div>
        <div className="stat-card stat-card--error">
          <XCircleIcon className="stat-icon" />
          <div>
            <p className="stat-label">Unsubscribed</p>
            <p className="stat-value">{stats.unsubscribed}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="controls">
        <div className="search-box">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className="search-clear">
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <FunnelIcon className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>

        <button onClick={handleExport} className="export-btn">
          <ArrowDownTrayIcon className="btn-icon" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading subscriptions...</div>
        ) : filteredAndSortedSubscriptions.length === 0 ? (
          <div className="empty-state">
            <EnvelopeIcon className="empty-icon" />
            <p>No newsletter subscriptions found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email
                  {sortField === 'email' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status
                  {sortField === 'status' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('subscribedAt')} className="sortable">
                  Subscribed At
                  {sortField === 'subscribedAt' && (
                    <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="email-cell">
                    <EnvelopeIcon className="cell-icon" />
                    {subscription.email}
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${subscription.status}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="ip-cell">{subscription.ipAddress || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="delete-btn"
                      title="Delete subscription"
                    >
                      <TrashIcon className="btn-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .newsletter-page {
          padding: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .stat-card--success {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }

        .stat-card--error {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .stat-icon {
          width: 2.5rem;
          height: 2.5rem;
          opacity: 0.7;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
        }

        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          opacity: 0.5;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: inherit;
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(118, 60, 172, 0.5);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: inherit;
          opacity: 0.5;
          cursor: pointer;
          padding: 0.25rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          width: 1.25rem;
          height: 1.25rem;
          opacity: 0.6;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: inherit;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(118, 60, 172, 0.2);
          border: 1px solid rgba(118, 60, 172, 0.4);
          border-radius: 8px;
          color: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: rgba(118, 60, 172, 0.3);
          transform: translateY(-2px);
        }

        .table-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
        }

        .data-table th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .data-table th.sortable:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .sort-indicator {
          margin-left: 0.5rem;
          opacity: 0.6;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .cell-icon {
          width: 1.25rem;
          height: 1.25rem;
          opacity: 0.5;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge--subscribed {
          background: rgba(34, 197, 94, 0.15);
          color: rgb(134, 239, 172);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-badge--unsubscribed {
          background: rgba(239, 68, 68, 0.15);
          color: rgb(252, 165, 165);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .date-cell {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .ip-cell {
          font-family: monospace;
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .delete-btn {
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: rgb(252, 165, 165);
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .loading-state,
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          opacity: 0.6;
        }

        .empty-icon {
          width: 4rem;
          height: 4rem;
          margin: 0 auto 1rem;
          opacity: 0.3;
        }

        @media (max-width: 768px) {
          .newsletter-page {
            padding: 1rem;
          }

          .controls {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .data-table {
            font-size: 0.875rem;
          }

          .data-table th,
          .data-table td {
            padding: 0.75rem 0.5rem;
          }

          .ip-cell {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
