'use client';

import { Bell, Menu, Search, X } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import OrgSwitcher from '@/components/layout/OrgSwitcher';
import UserProfileMenu from '@/components/layout/UserProfileMenu';
import Badge from '@/components/ui/Badge';

export default function TopNavbar({ onOpenMobileNav, onOpenNotifications }) {
  const { globalSearch, setGlobalSearch, unreadNotificationsCount, roleMeta } = useTenant();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <OrgSwitcher />
      </div>

      {/* Global Search (Tablet & Desktop) */}
      <div className="hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search tenant activity, actors, or resources..."
            aria-label="Global workspace search"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch('')}
              aria-label="Clear global search"
              className="absolute right-2.5 top-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden xl:block">
          <Badge tone={roleMeta.badgeTone}>{roleMeta.label}</Badge>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`Open notifications (${unreadNotificationsCount} unread)`}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <UserProfileMenu />
      </div>
    </header>
  );
}
