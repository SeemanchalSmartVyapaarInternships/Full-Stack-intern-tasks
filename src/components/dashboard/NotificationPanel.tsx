'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, CheckCircle, XCircle, Info, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { notifications as initialNotifs } from '@/data/mock';
import type { Notification } from '@/types';

const typeConfig = {
  success: { icon: CheckCircle,    iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50', dotColor: 'bg-emerald-500' },
  warning: { icon: AlertTriangle,  iconColor: 'text-amber-600',   bgColor: 'bg-amber-50',   dotColor: 'bg-amber-500'  },
  error:   { icon: XCircle,        iconColor: 'text-red-600',     bgColor: 'bg-red-50',     dotColor: 'bg-red-600'    },
  info:    { icon: Info,           iconColor: 'text-sky-600',     bgColor: 'bg-sky-50',     dotColor: 'bg-sky-500'    },
};

function formatRelativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifItem({ notif, onMarkRead, onDelete }: { notif: Notification; onMarkRead: (id: string) => void; onDelete: (id: string) => void }) {
  const config = typeConfig[notif.type];
  const Icon   = config.icon;

  return (
    <div id={`notif-${notif.id}`} className={clsx('relative flex gap-3 p-3 rounded-xl border transition-all duration-200 group', notif.read ? 'bg-white border-gray-100' : 'bg-red-50/30 border-red-100')}>
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
        <Icon size={16} className={config.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx('text-xs font-semibold', notif.read ? 'text-gray-600' : 'text-gray-800')}>{notif.title}</p>
          {!notif.read && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1', config.dotColor)} />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-xs text-gray-400 mt-1.5">{formatRelativeTime(notif.timestamp)}</p>
      </div>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <button onClick={() => onMarkRead(notif.id)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors" title="Mark as read" aria-label={`Mark as read: ${notif.title}`}>
            <CheckCheck size={11} />
          </button>
        )}
        <button onClick={() => onDelete(notif.id)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors" title="Delete" aria-label={`Delete: ${notif.title}`}>
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationPanel() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead    = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()           => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifs((prev) => prev.filter((n) => n.id !== id));

  return (
    <div id="notification-panel" className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={16} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 flex items-center justify-center text-white text-[8px] font-bold">{unreadCount}</span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button id="mark-all-read-btn" onClick={markAllRead} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors font-medium">
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {notifs.length === 0 ? (
          <div className="py-8 text-center">
            <Bell size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">All caught up!</p>
          </div>
        ) : (
          notifs.map((notif) => <NotifItem key={notif.id} notif={notif} onMarkRead={markRead} onDelete={deleteNotif} />)
        )}
      </div>
    </div>
  );
}
