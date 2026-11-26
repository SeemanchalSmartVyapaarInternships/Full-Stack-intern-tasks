'use client';

import { useState } from 'react';
import { CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import NotificationPanel from '@/components/layout/NotificationPanel';

export default function DashboardShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast, dismissToast } = useTenant();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-lg"
        >
          {toast.tone === 'emerald' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : toast.tone === 'rose' ? (
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-indigo-400" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss toast"
            className="rounded p-0.5 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
