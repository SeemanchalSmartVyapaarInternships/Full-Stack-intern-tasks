'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

const STATUS_TONES = {
  Completed: 'emerald',
  Pending: 'amber',
  Warning: 'indigo',
  Failed: 'rose',
};

export default function RecentActivityTable({ pageSize = 5, title = 'Recent Activity', showCategoryFilter = true }) {
  const { activeTenant, globalSearch, approveActivityTask, can } = useTenant();
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);

  const effectiveQuery = (localSearch || globalSearch).trim().toLowerCase();
  const canApprove = can('approveTasks');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(activeTenant.activities.map((a) => a.category)));
    return ['All', ...unique];
  }, [activeTenant.activities]);

  const filteredRows = useMemo(() => {
    const rows = activeTenant.activities.filter((row) => {
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && row.category !== categoryFilter) return false;
      if (!effectiveQuery) return true;
      return (
        row.actor.toLowerCase().includes(effectiveQuery) ||
        row.action.toLowerCase().includes(effectiveQuery) ||
        row.resource.toLowerCase().includes(effectiveQuery) ||
        row.id.toLowerCase().includes(effectiveQuery)
      );
    });

    return [...rows].sort((a, b) => {
      const valA = String(a[sortBy] || '').toLowerCase();
      const valB = String(b[sortBy] || '').toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTenant.activities, statusFilter, categoryFilter, effectiveQuery, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  return (
    <>
      <Card
        title={title}
        subtitle={`Tenant-scoped audit events for ${activeTenant.name} (${filteredRows.length} matching)`}
        noPadding
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter events..."
                aria-label="Filter recent activity"
                className="w-40 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none sm:w-48"
              />
            </div>

            <div className="relative shrink-0">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none whitespace-nowrap rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Warning">Warning</option>
                <option value="Failed">Failed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {showCategoryFilter && (
              <div className="relative hidden shrink-0 sm:block">
                <select
                  aria-label="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none whitespace-nowrap rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
              </div>
            )}
          </div>
        }
      >
        {paginatedRows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Filter}
              title="No activity events found"
              description="Try clearing your search term or switching status filters."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setStatusFilter('All');
                    setCategoryFilter('All');
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Reset Filters
                </button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('actor')}
                        className="inline-flex items-center gap-1 hover:text-slate-800"
                      >
                        Actor
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3">Action & Resource</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('status')}
                        className="inline-flex items-center gap-1 hover:text-slate-800"
                      >
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('timestamp')}
                        className="inline-flex items-center gap-1 hover:text-slate-800"
                      >
                        Timestamp
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{row.actor}</p>
                        <p className="text-[11px] text-slate-500">{row.actorRole}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">{row.action}</p>
                        <p className="text-[11px] text-slate-500">{row.resource}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{row.category}</td>
                      <td className="px-4 py-3.5">
                        <Badge tone={STATUS_TONES[row.status] || 'slate'}>{row.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">{row.timestamp}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {row.status === 'Pending' && canApprove && (
                            <button
                              type="button"
                              onClick={() => approveActivityTask(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedRow(row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3 w-3" />
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {paginatedRows.map((row) => (
                <li key={row.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{row.action}</p>
                      <p className="text-[11px] text-slate-500">
                        {row.actor} · {row.resource}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONES[row.status] || 'slate'}>{row.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {row.category} · {row.timestamp}
                    </span>
                    <div className="flex items-center gap-2">
                      {row.status === 'Pending' && canApprove && (
                        <button
                          type="button"
                          onClick={() => approveActivityTask(row.id)}
                          className="font-semibold text-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedRow(row)}
                        className="font-semibold text-indigo-600"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title={selectedRow ? `Audit Event ${selectedRow.id}` : ''}
        subtitle={selectedRow ? `${activeTenant.name} · ${selectedRow.timestamp}` : ''}
      >
        {selectedRow && (
          <dl className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
              <dt className="font-medium text-slate-500">Actor</dt>
              <dd className="col-span-2 font-semibold text-slate-900">
                {selectedRow.actor} ({selectedRow.actorEmail})
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <dt className="font-medium text-slate-500">Role</dt>
              <dd className="col-span-2 text-slate-800">{selectedRow.actorRole}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <dt className="font-medium text-slate-500">Action</dt>
              <dd className="col-span-2 font-medium text-slate-900">{selectedRow.action}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <dt className="font-medium text-slate-500">Resource</dt>
              <dd className="col-span-2 text-slate-800">{selectedRow.resource}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <dt className="font-medium text-slate-500">IP Address</dt>
              <dd className="col-span-2 font-mono text-slate-700">{selectedRow.ip}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2 px-3">
              <dt className="font-medium text-slate-500">Details</dt>
              <dd className="col-span-2 leading-relaxed text-slate-700">{selectedRow.details}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  );
}
