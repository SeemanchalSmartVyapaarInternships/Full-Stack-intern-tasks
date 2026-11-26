'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Settings, Shield, Users } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { ROLES } from '@/lib/permissions';
import Badge from '@/components/ui/Badge';

export default function UserProfileMenu() {
  const { user, activeRole, roleMeta, switchRole } = useTenant();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="User profile and role menu"
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
          {user.avatarInitials}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-xs font-semibold leading-tight text-slate-900">{user.name}</p>
          <p className="text-[11px] leading-tight text-slate-500">{roleMeta.label}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* Profile Summary */}
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Active RBAC Context</span>
              <Badge tone={roleMeta.badgeTone}>{roleMeta.label}</Badge>
            </div>
          </div>

          {/* Role-Based UI Simulator */}
          <div className="border-b border-slate-100 p-2">
            <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Shield className="h-3 w-3" />
              Switch Role Preview
            </p>
            <div className="space-y-0.5">
              {ROLES.map((role) => {
                const selected = role.id === activeRole;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => switchRole(role.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                      selected ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{role.label}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-1.5">
            <Link
              href="/team"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Users className="h-4 w-4 text-slate-400" />
              Team & Permission Matrix
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Profile & Workspace Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
