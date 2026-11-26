'use client';

import { useState } from 'react';
import { Lock, Save, Shield } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

function WorkspaceSettingsForm({ activeTenant, canEditWorkspace, roleMeta, onSave }) {
  const [workspaceForm, setWorkspaceForm] = useState({
    name: activeTenant.name,
    industry: activeTenant.industry,
    region: activeTenant.region,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(workspaceForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ws-name" className="block text-xs font-medium text-slate-700">
          Organization Name
        </label>
        <input
          id="ws-name"
          type="text"
          disabled={!canEditWorkspace}
          value={workspaceForm.name}
          onChange={(e) => setWorkspaceForm((p) => ({ ...p, name: e.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>

      <div>
        <label htmlFor="ws-industry" className="block text-xs font-medium text-slate-700">
          Industry Vertical
        </label>
        <input
          id="ws-industry"
          type="text"
          disabled={!canEditWorkspace}
          value={workspaceForm.industry}
          onChange={(e) => setWorkspaceForm((p) => ({ ...p, industry: e.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>

      <div>
        <label htmlFor="ws-region" className="block text-xs font-medium text-slate-700">
          Data Residency Region
        </label>
        <select
          id="ws-region"
          disabled={!canEditWorkspace}
          value={workspaceForm.region}
          onChange={(e) => setWorkspaceForm((p) => ({ ...p, region: e.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
        >
          <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai)</option>
          <option value="ap-south-2 (Hyderabad)">ap-south-2 (Hyderabad)</option>
          <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
        </select>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
        <p>
          {canEditWorkspace
            ? 'You have administrative permission to update workspace metadata for this tenant.'
            : `Your current role (${roleMeta.label}) has read-only access. Switch to Tenant Admin or Owner to modify workspace settings.`}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canEditWorkspace}
        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
          canEditWorkspace
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'cursor-not-allowed bg-slate-200 text-slate-500'
        }`}
      >
        {canEditWorkspace ? <Save className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
        Save Workspace Settings
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const { user, activeTenant, roleMeta, can, updateUserProfile, updateTenantSettings } = useTenant();

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    title: user.title,
    location: user.location,
  });

  const canEditWorkspace = can('editSettings');

  const handleProfileSave = (event) => {
    event.preventDefault();
    updateUserProfile(profileForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Profile & Workspace Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your personal operator profile and tenant-level governance policies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="User Profile"
          subtitle="Personal identity and active role context"
          action={<Badge tone={roleMeta.badgeTone}>{roleMeta.label}</Badge>}
        >
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                {user.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-slate-700">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-title" className="block text-xs font-medium text-slate-700">
                Job Title
              </label>
              <input
                id="profile-title"
                type="text"
                value={profileForm.title}
                onChange={(e) => setProfileForm((p) => ({ ...p, title: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-location" className="block text-xs font-medium text-slate-700">
                Timezone & Location
              </label>
              <input
                id="profile-location"
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Save className="h-3.5 w-3.5" />
              Save Profile
            </button>
          </form>
        </Card>

        <Card
          title="Tenant Workspace Configuration"
          subtitle={`Active organization: ${activeTenant.name}`}
          action={
            !canEditWorkspace && (
              <Badge tone="slate">
                <Lock className="h-3 w-3" />
                Read Only
              </Badge>
            )
          }
        >
          <WorkspaceSettingsForm
            key={activeTenant.id}
            activeTenant={activeTenant}
            canEditWorkspace={canEditWorkspace}
            roleMeta={roleMeta}
            onSave={updateTenantSettings}
          />
        </Card>
      </div>
    </div>
  );
}
