'use client';

import { useState } from 'react';
import { Check, Lock, Minus, UserPlus } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { PERMISSION_LABELS, ROLES, getRoleMeta, hasPermission } from '@/lib/permissions';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function TeamPage() {
  const { activeTenant, can, inviteMember, updateMemberRole, roleMeta } = useTenant();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'manager', department: 'Operations' });

  const canManage = can('manageTeam');
  const canEditRoles = can('editRoles');

  const handleInvite = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    inviteMember(form);
    setInviteOpen(false);
    setForm({ name: '', email: '', role: 'manager', department: 'Operations' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Team & RBAC Access Control
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage members for {activeTenant.name}. Active preview role: <strong>{roleMeta.label}</strong>
          </p>
        </div>

        <button
          type="button"
          disabled={!canManage}
          onClick={() => setInviteOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            canManage
              ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          {canManage ? <UserPlus className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          {canManage ? 'Invite Member' : 'Admin Role Required'}
        </button>
      </div>

      {/* Members Directory */}
      <Card
        title="Organization Members"
        subtitle={`${activeTenant.members.length} members in ${activeTenant.name}`}
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Member</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTenant.members.map((member) => {
                const memberRoleMeta = getRoleMeta(member.role);
                return (
                  <tr key={member.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-[11px] text-slate-500">{member.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{member.department}</td>
                    <td className="px-4 py-3.5">
                      {canEditRoles ? (
                        <select
                          aria-label={`Role for ${member.name}`}
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                        >
                          {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge tone={memberRoleMeta.badgeTone}>{memberRoleMeta.label}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={member.status === 'Active' ? 'emerald' : 'amber'}>{member.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">{member.lastActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RBAC Matrix */}
      <Card
        title="Role-Based Permission Matrix"
        subtitle="Switch roles from the top-right User Profile menu to test UI access controls live."
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Capability</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="px-4 py-3 text-center">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_LABELS.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-medium text-slate-800">{perm.label}</td>
                  {ROLES.map((r) => {
                    const granted = hasPermission(r.id, perm.key);
                    return (
                      <td key={r.id} className="px-4 py-3 text-center">
                        {granted ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Minus className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={`Invite Member to ${activeTenant.name}`}
        subtitle="Assign an initial RBAC role and department."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="member-name" className="block text-xs font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="member-name"
              type="text"
              required
              placeholder="e.g., Ayesha Khan"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="member-email" className="block text-xs font-medium text-slate-700">
              Work Email
            </label>
            <input
              id="member-email"
              type="email"
              required
              placeholder="ayesha@company.in"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="member-role" className="block text-xs font-medium text-slate-700">
                Role
              </label>
              <select
                id="member-role"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="member-dept" className="block text-xs font-medium text-slate-700">
                Department
              </label>
              <input
                id="member-dept"
                type="text"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
