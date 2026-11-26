'use client';

import { useState } from 'react';
import { Bell, CheckCheck, ShieldAlert, Sparkles, Trash2, X } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import Badge from '@/components/ui/Badge';

export default function NotificationPanel({ isOpen, onClose }) {
  const {
    activeTenant,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearReadNotifications,
  } = useTenant();
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const filteredNotifications = activeTenant.notifications.filter((item) => {
    if (filter === 'unread') return item.unread;
    if (filter === 'security') return item.category === 'security';
    return true;
  });

  const categoryTone = (category) => {
    if (category === 'security') return 'rose';
    if (category === 'billing') return 'amber';
    if (category === 'activity') return 'indigo';
    return 'slate';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs" onClick={onClose}>
      <aside
        aria-label="Notification Panel"
        className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              <p className="text-xs text-slate-500">
                {activeTenant.name} · {unreadNotificationsCount} unread
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification panel"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadNotificationsCount})` },
              { id: 'security', label: 'Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === tab.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              title="Mark all as read"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </button>
            <button
              type="button"
              onClick={clearReadNotifications}
              title="Clear read notifications"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-center">
              <Sparkles className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-700">All caught up</p>
              <p className="mt-0.5 text-xs text-slate-500">No notifications match this filter for {activeTenant.name}.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filteredNotifications.map((item) => (
                <li
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                    item.unread
                      ? 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.category === 'security' && <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />}
                      <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.unread && <span className="h-2 w-2 rounded-full bg-indigo-600" aria-label="Unread" />}
                      <span className="text-[11px] text-slate-400">{item.time}</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.description}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <Badge tone={categoryTone(item.category)}>{item.category}</Badge>
                    {item.unread && (
                      <span className="text-[11px] font-medium text-indigo-600">Click to mark read</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
