'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Lock, Plus } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const ACCENT_MAP = {
  indigo: 'bg-indigo-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  blue: 'bg-sky-600 text-white',
};

export default function OrgSwitcher() {
  const { tenants, activeTenant, switchTenant, createTenant, can } = useTenant();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    industry: 'Healthcare & Clinics',
    plan: 'Growth',
    region: 'ap-south-1 (Mumbai)',
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCreateSubmit = (event) => {
    event.preventDefault();
    if (!formState.name.trim()) return;
    const created = createTenant(formState);
    if (created) {
      setCreateOpen(false);
      setOpen(false);
      setFormState({
        name: '',
        industry: 'Healthcare & Clinics',
        plan: 'Growth',
        region: 'ap-south-1 (Mumbai)',
      });
    }
  };

  const canCreate = can('createTenant');

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Switch organization workspace"
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
            ACCENT_MAP[activeTenant.accent] || ACCENT_MAP.indigo
          }`}
        >
          {activeTenant.initials}
        </span>
        <div className="hidden min-w-0 sm:block">
          <div className="flex items-center gap-1.5">
            <span className="max-w-[140px] truncate text-xs font-semibold text-slate-900 md:max-w-[180px]">
              {activeTenant.name}
            </span>
            <Badge tone={activeTenant.plan === 'Enterprise' ? 'indigo' : activeTenant.plan === 'Growth' ? 'emerald' : 'amber'}>
              {activeTenant.plan}
            </Badge>
          </div>
          <p className="truncate text-[11px] text-slate-500">{activeTenant.industry}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tenant Workspaces ({tenants.length})
            </p>
          </div>
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto p-1.5">
            {tenants.map((tenant) => {
              const isActive = tenant.id === activeTenant.id;
              return (
                <li key={tenant.id}>
                  <button
                    type="button"
                    onClick={() => {
                      switchTenant(tenant.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isActive ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          ACCENT_MAP[tenant.accent] || ACCENT_MAP.indigo
                        }`}
                      >
                        {tenant.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">{tenant.name}</p>
                        <p className="truncate text-[11px] text-slate-500">
                          {tenant.plan} · {tenant.usage.seatsUsed}/{tenant.usage.seatsLimit} seats
                        </p>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50/80 p-2">
            <button
              type="button"
              disabled={!canCreate}
              onClick={() => setCreateOpen(true)}
              title={canCreate ? 'Provision a new tenant workspace' : 'Owner role required to create tenants'}
              className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                canCreate
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'cursor-not-allowed bg-slate-200/70 text-slate-500'
              }`}
            >
              {canCreate ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {canCreate ? 'Create New Organization' : 'Create Organization (Owner Only)'}
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Provision Tenant Workspace"
        subtitle="Create an isolated multi-tenant environment with dedicated quotas and audit logs."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label htmlFor="tenant-name" className="block text-xs font-medium text-slate-700">
              Organization Name
            </label>
            <div className="relative mt-1.5">
              <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="tenant-name"
                type="text"
                required
                placeholder="e.g., Mithila Agro Logistics"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tenant-industry" className="block text-xs font-medium text-slate-700">
                Industry Vertical
              </label>
              <input
                id="tenant-industry"
                type="text"
                value={formState.industry}
                onChange={(e) => setFormState((prev) => ({ ...prev, industry: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="tenant-plan" className="block text-xs font-medium text-slate-700">
                Subscription Tier
              </label>
              <select
                id="tenant-plan"
                value={formState.plan}
                onChange={(e) => setFormState((prev) => ({ ...prev, plan: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Starter">Starter (25 seats)</option>
                <option value="Growth">Growth (60 seats)</option>
                <option value="Enterprise">Enterprise (150 seats)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tenant-region" className="block text-xs font-medium text-slate-700">
              Primary Data Residency Region
            </label>
            <select
              id="tenant-region"
              value={formState.region}
              onChange={(e) => setFormState((prev) => ({ ...prev, region: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
              <option value="ap-south-2 (Hyderabad)">ap-south-2 (Hyderabad)</option>
              <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Provision Workspace
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
