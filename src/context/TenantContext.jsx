'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { INITIAL_TENANTS, INITIAL_USER } from '@/data/mockTenants';
import { getRoleMeta, hasPermission } from '@/lib/permissions';
import { formatCurrency } from '@/lib/formatters';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState(INITIAL_TENANTS[0].id);
  const [activeRole, setActiveRole] = useState(INITIAL_USER.defaultRole);
  const [user, setUser] = useState(INITIAL_USER);
  const [timeframe, setTimeframe] = useState('7d');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, tone = 'indigo') => {
    setToast({ id: Date.now(), message, tone });
    setTimeout(() => {
      setToast((current) => (current && Date.now() - current.id >= 2900 ? null : current));
    }, 3000);
  };

  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === activeTenantId) || tenants[0],
    [tenants, activeTenantId]
  );

  const roleMeta = useMemo(() => getRoleMeta(activeRole), [activeRole]);

  const can = (permissionKey) => hasPermission(activeRole, permissionKey);

  const switchTenant = (tenantId) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    setActiveTenantId(tenantId);
    setGlobalSearch('');
    showToast(`Switched workspace to ${target.name}`, 'indigo');
  };

  const switchRole = (roleId) => {
    const meta = getRoleMeta(roleId);
    setActiveRole(meta.id);
    showToast(`RBAC preview switched to ${meta.label}`, 'emerald');
  };

  const updateActiveTenant = (updater) => {
    setTenants((prev) =>
      prev.map((tenant) => (tenant.id === activeTenant.id ? updater(tenant) : tenant))
    );
  };

  const markNotificationRead = (notificationId) => {
    updateActiveTenant((tenant) => ({
      ...tenant,
      notifications: tenant.notifications.map((n) =>
        n.id === notificationId ? { ...n, unread: false } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    updateActiveTenant((tenant) => ({
      ...tenant,
      notifications: tenant.notifications.map((n) => ({ ...n, unread: false })),
    }));
    showToast('All tenant notifications marked as read', 'slate');
  };

  const clearReadNotifications = () => {
    updateActiveTenant((tenant) => ({
      ...tenant,
      notifications: tenant.notifications.filter((n) => n.unread),
    }));
  };

  const approveActivityTask = (activityId) => {
    if (!can('approveTasks')) {
      showToast('Permission denied: Manager role or higher required', 'rose');
      return;
    }
    updateActiveTenant((tenant) => ({
      ...tenant,
      activities: tenant.activities.map((act) =>
        act.id === activityId ? { ...act, status: 'Completed' } : act
      ),
      notifications: [
        {
          id: `N-${Date.now()}`,
          title: `Approved ${activityId}`,
          description: `${user.name} (${roleMeta.label}) approved pending workflow item.`,
          category: 'activity',
          time: 'Just now',
          unread: true,
        },
        ...tenant.notifications,
      ],
    }));
    showToast(`Activity ${activityId} marked as Completed`, 'emerald');
  };

  const createTenant = ({ name, industry, plan, region }) => {
    if (!can('createTenant')) {
      showToast('Only Owner role can provision new tenants', 'rose');
      return null;
    }
    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const words = cleanName.split(/\s+/).filter(Boolean);
    const initials = (words[0]?.[0] || 'T') + (words[1]?.[0] || words[0]?.[1] || 'N');

    const planMrr = plan === 'Enterprise' ? 350000 : plan === 'Growth' ? 145000 : 49000;
    const seatsLimit = plan === 'Enterprise' ? 150 : plan === 'Growth' ? 60 : 25;
    const storageLimitGb = plan === 'Enterprise' ? 100 : plan === 'Growth' ? 50 : 20;
    const apiCallsLimit = plan === 'Enterprise' ? 2000000 : plan === 'Growth' ? 1000000 : 250000;

    const newTenant = {
      id: `${slug || 'tenant'}-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      slug: slug || 'new-tenant',
      industry: industry || 'SaaS Operations',
      plan: plan || 'Growth',
      region: region || 'ap-south-1 (Mumbai)',
      status: 'Healthy',
      currency: 'INR',
      accent: 'blue',
      initials: initials.toUpperCase(),
      mrr: planMrr,
      domain: `${slug || 'workspace'}.vyapaarpulse.in`,
      kpis: [
        {
          id: 'revenue',
          label: 'Monthly Recurring Revenue',
          value: formatCurrency(planMrr, 'INR'),
          delta: '+100%',
          trend: 'up',
          comparison: 'Newly provisioned subscription',
        },
        {
          id: 'users',
          label: 'Active Users',
          value: '12',
          delta: '+12',
          trend: 'up',
          comparison: `${seatsLimit} licensed seats available`,
        },
        {
          id: 'approvals',
          label: 'Pending Approvals',
          value: '1',
          delta: '0%',
          trend: 'down',
          comparison: 'Initial workspace setup check',
        },
        {
          id: 'uptime',
          label: 'API SLA Uptime',
          value: '100.0%',
          delta: '+0.00%',
          trend: 'up',
          comparison: '72ms avg edge latency',
        },
      ],
      usage: {
        seatsUsed: 1,
        seatsLimit,
        storageUsedGb: 1,
        storageLimitGb,
        apiCallsUsed: 2400,
        apiCallsLimit,
        integrationsActive: 1,
      },
      revenueSeries: {
        '7d': [
          { label: 'Mon', revenue: Math.round(planMrr * 0.12), sessions: 40 },
          { label: 'Tue', revenue: Math.round(planMrr * 0.14), sessions: 55 },
          { label: 'Wed', revenue: Math.round(planMrr * 0.13), sessions: 52 },
          { label: 'Thu', revenue: Math.round(planMrr * 0.16), sessions: 64 },
          { label: 'Fri', revenue: Math.round(planMrr * 0.18), sessions: 71 },
          { label: 'Sat', revenue: Math.round(planMrr * 0.14), sessions: 48 },
          { label: 'Sun', revenue: Math.round(planMrr * 0.13), sessions: 45 },
        ],
        '30d': [
          { label: 'W1', revenue: Math.round(planMrr * 0.22), sessions: 180 },
          { label: 'W2', revenue: Math.round(planMrr * 0.24), sessions: 210 },
          { label: 'W3', revenue: Math.round(planMrr * 0.26), sessions: 245 },
          { label: 'W4', revenue: Math.round(planMrr * 0.28), sessions: 270 },
        ],
        '90d': [
          { label: 'Sep', revenue: Math.round(planMrr * 0.7), sessions: 650 },
          { label: 'Oct', revenue: Math.round(planMrr * 0.85), sessions: 780 },
          { label: 'Nov', revenue: planMrr, sessions: 905 },
        ],
      },
      activities: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          actor: user.name,
          actorEmail: user.email,
          actorRole: roleMeta.label,
          action: 'Provisioned tenant workspace',
          resource: cleanName,
          category: 'Workspace',
          status: 'Completed',
          timestamp: '2026-11-26 17:05',
          ip: '106.210.44.18',
          details: `Created ${plan} tier workspace in ${region}.`,
        },
      ],
      notifications: [
        {
          id: `N-${Date.now()}`,
          title: `${cleanName} provisioned`,
          description: `Workspace is live on ${plan} plan in ${region}.`,
          category: 'system',
          time: 'Just now',
          unread: true,
        },
      ],
      members: [
        {
          id: `U-${Date.now()}`,
          name: user.name,
          email: user.email,
          role: 'owner',
          department: 'Platform Engineering',
          status: 'Active',
          lastActive: 'Online now',
        },
      ],
    };

    setTenants((prev) => [...prev, newTenant]);
    setActiveTenantId(newTenant.id);
    showToast(`Provisioned new tenant: ${cleanName}`, 'emerald');
    return newTenant;
  };

  const inviteMember = ({ name, email, role, department }) => {
    if (!can('manageTeam')) {
      showToast('Permission denied: Admin role or higher required', 'rose');
      return;
    }
    const newMember = {
      id: `U-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim(),
      role,
      department: department.trim() || 'Operations',
      status: 'Invited',
      lastActive: 'Pending invite',
    };
    updateActiveTenant((tenant) => ({
      ...tenant,
      members: [newMember, ...tenant.members],
      usage: {
        ...tenant.usage,
        seatsUsed: tenant.usage.seatsUsed + 1,
      },
      activities: [
        {
          id: `ACT-${Date.now().toString().slice(-4)}`,
          actor: user.name,
          actorEmail: user.email,
          actorRole: roleMeta.label,
          action: 'Invited team member',
          resource: `${newMember.name} (${getRoleMeta(role).label})`,
          category: 'Security',
          status: 'Completed',
          timestamp: '2026-11-26 17:08',
          ip: '106.210.44.18',
          details: `Sent workspace invitation to ${newMember.email}.`,
        },
        ...tenant.activities,
      ],
    }));
    showToast(`Invitation sent to ${newMember.email}`, 'emerald');
  };

  const updateMemberRole = (memberId, newRole) => {
    if (!can('editRoles')) {
      showToast('Only Owner role can modify RBAC member roles', 'rose');
      return;
    }
    updateActiveTenant((tenant) => ({
      ...tenant,
      members: tenant.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    }));
    showToast(`Updated member role to ${getRoleMeta(newRole).label}`, 'indigo');
  };

  const updateTenantSettings = (updates) => {
    if (!can('editSettings')) {
      showToast('Permission denied: Admin role required', 'rose');
      return;
    }
    updateActiveTenant((tenant) => ({
      ...tenant,
      ...updates,
    }));
    showToast('Workspace settings saved', 'emerald');
  };

  const updateUserProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('User profile updated', 'emerald');
  };

  const unreadNotificationsCount = useMemo(
    () => activeTenant.notifications.filter((n) => n.unread).length,
    [activeTenant]
  );

  const value = {
    tenants,
    activeTenant,
    activeTenantId: activeTenant.id,
    activeRole,
    roleMeta,
    user,
    timeframe,
    setTimeframe,
    globalSearch,
    setGlobalSearch,
    unreadNotificationsCount,
    can,
    switchTenant,
    switchRole,
    createTenant,
    markNotificationRead,
    markAllNotificationsRead,
    clearReadNotifications,
    approveActivityTask,
    inviteMember,
    updateMemberRole,
    updateTenantSettings,
    updateUserProfile,
    toast,
    dismissToast: () => setToast(null),
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return ctx;
}
