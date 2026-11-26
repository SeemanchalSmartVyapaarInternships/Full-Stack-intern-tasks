'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { computeUsagePercent } from '@/lib/formatters';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { href: '/', label: 'Dashboard Overview', icon: LayoutDashboard, permission: 'viewDashboard' },
      { href: '/analytics', label: 'Analytics & Usage', icon: BarChart3, permission: 'viewAnalytics' },
      { href: '/activity', label: 'Audit & Activity', icon: Activity, permission: 'viewDashboard' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/organizations', label: 'Organizations', icon: Building2, permission: 'viewOrganizations' },
      { href: '/team', label: 'Team & RBAC', icon: Users, permission: 'viewDashboard' },
      { href: '/settings', label: 'Settings & Profile', icon: Settings, permission: 'viewDashboard' },
    ],
  },
];

export default function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { activeTenant, can } = useTenant();
  const seatPercent = computeUsagePercent(activeTenant.usage.seatsUsed, activeTenant.usage.seatsLimit);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:static lg:z-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden" onClick={onCloseMobile}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">VyapaarPulse</p>
                <p className="truncate text-[11px] font-medium text-slate-500">Multi-Tenant Admin</p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:inline-flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isAllowed = can(item.permission);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </span>
                        {!collapsed && !isAllowed && (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Restricted by role" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Active Tenant Plan Footer */}
        <div className="border-t border-slate-100 p-3">
          {collapsed ? (
            <div
              className="flex h-10 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
              title={`${activeTenant.name} (${activeTenant.plan})`}
            >
              {activeTenant.initials}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-slate-800">{activeTenant.plan} Tier</span>
                <span className="text-[11px] font-medium text-indigo-600">{seatPercent}% seats</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${seatPercent}%` }}
                />
              </div>
              <p className="mt-2 truncate text-[11px] text-slate-500">
                {activeTenant.usage.seatsUsed} of {activeTenant.usage.seatsLimit} seats active
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
