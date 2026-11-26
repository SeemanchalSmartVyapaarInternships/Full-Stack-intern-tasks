'use client';

import { useState } from 'react';
import { Building2, Check, Globe, Lock, Plus, ShieldAlert, Users } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency } from '@/lib/formatters';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';

export default function OrganizationsPage() {
  const { tenants, activeTenantId, switchTenant, createTenant, can, roleMeta } = useTenant();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    industry: 'Enterprise ERP',
    plan: 'Growth',
    region: 'ap-south-1 (Mumbai)',
  });

  if (!can('viewOrganizations')) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Organization Directory Restricted"
        description={`Your current role (${roleMeta.label}) does not have permission to view multi-tenant organization listings. Switch to Manager, Admin, or Owner in the top-right profile menu to preview this page.`}
      />
    );
  }

  const canCreate = can('createTenant');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const created = createTenant(form);
    if (created) {
      setModalOpen(false);
      setForm({ name: '', industry: 'Enterprise ERP', plan: 'Growth', region: 'ap-south-1 (Mumbai)' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Tenant Organizations
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage isolated tenant workspaces, subscription tiers, and regional deployments.
          </p>
        </div>

        <button
          type="button"
          disabled={!canCreate}
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            canCreate
              ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          {canCreate ? <Plus className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          {canCreate ? 'Provision Tenant' : 'Owner Role Required'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tenants.map((tenant) => {
          const isCurrent = tenant.id === activeTenantId;
          return (
            <Card
              key={tenant.id}
              className={isCurrent ? 'ring-2 ring-indigo-600/30 border-indigo-300' : ''}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    {tenant.initials}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{tenant.name}</h2>
                    <p className="text-xs text-slate-500">{tenant.industry}</p>
                  </div>
                </div>
                <Badge tone={tenant.status === 'Healthy' ? 'emerald' : 'amber'}>{tenant.status}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="text-[11px] text-slate-500">Monthly MRR</p>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    {formatCurrency(tenant.mrr, tenant.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Subscription</p>
                  <p className="mt-0.5 font-semibold text-slate-900">{tenant.plan}</p>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {tenant.usage.seatsUsed}/{tenant.usage.seatsLimit} seats
                  </span>
                </div>
                <div className="flex items-center gap-1 truncate text-slate-600">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{tenant.region.split(' ')[0]}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-slate-400">{tenant.domain}</span>
                <button
                  type="button"
                  onClick={() => switchTenant(tenant.id)}
                  disabled={isCurrent}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </>
                  ) : (
                    'Switch Workspace'
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision New Organization"
        subtitle="Creates an isolated tenant workspace with default quotas."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="org-name" className="block text-xs font-medium text-slate-700">
              Organization Name
            </label>
            <div className="relative mt-1.5">
              <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="org-name"
                type="text"
                required
                placeholder="e.g., Kosi FinServe Pvt Ltd"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="org-industry" className="block text-xs font-medium text-slate-700">
                Industry
              </label>
              <input
                id="org-industry"
                type="text"
                value={form.industry}
                onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="org-plan" className="block text-xs font-medium text-slate-700">
                Plan Tier
              </label>
              <select
                id="org-plan"
                value={form.plan}
                onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Create Tenant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
