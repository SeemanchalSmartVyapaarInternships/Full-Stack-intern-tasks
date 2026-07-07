'use client';

import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Activity, ExternalLink, Filter } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { recentActivity } from '@/data/mock';
import type { ActivityItem } from '@/types';

type SortField = 'timestamp' | 'user' | 'status' | 'amount';
type SortDir   = 'asc' | 'desc';

const statusVariant: Record<ActivityItem['status'], 'success' | 'warning' | 'error' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'error', processing: 'info',
};

const typeColors: Record<ActivityItem['type'], string> = {
  transaction: 'text-red-600',
  user:        'text-sky-600',
  system:      'text-amber-600',
  content:     'text-emerald-600',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const PAGE_SIZE = 5;

export default function ActivityTable() {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');
  const [page, setPage]           = useState(0);
  const [filter, setFilter]       = useState<ActivityItem['status'] | 'all'>('all');

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(0);
  };

  const filtered = filter === 'all' ? recentActivity : recentActivity.filter((a) => a.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    let compare = 0;
    if (sortField === 'timestamp') compare = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    else if (sortField === 'user') compare = a.user.name.localeCompare(b.user.name);
    else if (sortField === 'status') compare = a.status.localeCompare(b.status);
    else if (sortField === 'amount') {
      compare = parseFloat((a.amount || '0').replace(/[$,]/g, '')) - parseFloat((b.amount || '0').replace(/[$,]/g, ''));
    }
    return sortDir === 'asc' ? compare : -compare;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={clsx('flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:text-gray-700', sortField === field ? 'text-red-600' : 'text-gray-400')}
    >
      {label} <ArrowUpDown size={10} />
    </button>
  );

  return (
    <div id="activity-table-card" className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Activity size={15} className="text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            <p className="text-xs text-gray-500">{filtered.length} events today</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-gray-400" />
          {(['all', 'completed', 'pending', 'failed', 'processing'] as const).map((f) => (
            <button
              key={f}
              id={`activity-filter-${f}`}
              onClick={() => { setFilter(f); setPage(0); }}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                filter === f ? 'bg-red-50 text-red-700 border border-red-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Recent activity table">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left"><SortBtn field="user" label="User" /></th>
              <th className="px-3 py-3 text-left hidden md:table-cell"><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Action</span></th>
              <th className="px-3 py-3 text-left"><SortBtn field="status" label="Status" /></th>
              <th className="px-3 py-3 text-right hidden sm:table-cell"><SortBtn field="amount" label="Amount" /></th>
              <th className="px-3 py-3 text-right hidden lg:table-cell"><SortBtn field="timestamp" label="Time" /></th>
              <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageData.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No activity found</td></tr>
            ) : (
              pageData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={item.user.avatar} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.user.name}</p>
                        <p className="text-xs text-gray-400 truncate hidden sm:block">{item.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-gray-600">{item.action}</p>
                    <p className={clsx('text-xs mt-0.5 truncate max-w-[160px]', typeColors[item.type])}>{item.target}</p>
                  </td>
                  <td className="px-3 py-3.5"><Badge variant={statusVariant[item.status]} dot>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge></td>
                  <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                    {item.amount ? <span className="text-sm font-semibold text-gray-700">{item.amount}</span> : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3.5 text-right hidden lg:table-cell">
                    <span className="text-xs text-gray-400">{formatTime(item.timestamp)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 ml-auto" aria-label={`View ${item.user.name}`}>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}</p>
          <div className="flex gap-1">
            <button id="activity-prev-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-200">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} id={`activity-page-${i + 1}`} onClick={() => setPage(i)}
                className={clsx('w-7 h-7 rounded-lg text-xs font-medium transition-all border', page === i ? 'bg-red-600 text-white border-red-600' : 'text-gray-500 border-gray-200 hover:bg-white hover:text-gray-800')}>
                {i + 1}
              </button>
            ))}
            <button id="activity-next-btn" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gray-200">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
