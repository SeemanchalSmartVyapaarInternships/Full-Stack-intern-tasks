export const ROLES = [
  {
    id: 'owner',
    label: 'Owner',
    description: 'Full platform control including billing, tenant creation, and RBAC policy.',
    badgeTone: 'indigo',
  },
  {
    id: 'admin',
    label: 'Tenant Admin',
    description: 'Manages organization members, workspace settings, and security audits.',
    badgeTone: 'emerald',
  },
  {
    id: 'manager',
    label: 'Operations Manager',
    description: 'Reviews analytics, approves operational workflows, and exports reports.',
    badgeTone: 'amber',
  },
  {
    id: 'viewer',
    label: 'Employee / Viewer',
    description: 'Read-only visibility into overview metrics and personal notifications.',
    badgeTone: 'slate',
  },
];

export const PERMISSION_MATRIX = {
  viewDashboard: ['owner', 'admin', 'manager', 'viewer'],
  viewAnalytics: ['owner', 'admin', 'manager', 'viewer'],
  viewOrganizations: ['owner', 'admin', 'manager'],
  createTenant: ['owner'],
  switchTenant: ['owner', 'admin', 'manager', 'viewer'],
  manageTeam: ['owner', 'admin'],
  editRoles: ['owner'],
  approveTasks: ['owner', 'admin', 'manager'],
  exportAudit: ['owner', 'admin', 'manager'],
  editSettings: ['owner', 'admin'],
  viewBilling: ['owner', 'admin'],
  deleteWorkspace: ['owner'],
};

export const PERMISSION_LABELS = [
  { key: 'viewDashboard', label: 'View Dashboard Overview' },
  { key: 'viewAnalytics', label: 'View Usage & Analytics' },
  { key: 'viewOrganizations', label: 'Access Tenant Directory' },
  { key: 'createTenant', label: 'Provision New Tenants' },
  { key: 'manageTeam', label: 'Invite & Manage Members' },
  { key: 'editRoles', label: 'Modify RBAC Role Policies' },
  { key: 'approveTasks', label: 'Approve Operational Tasks' },
  { key: 'exportAudit', label: 'Export Audit Logs (CSV)' },
  { key: 'editSettings', label: 'Modify Workspace Settings' },
  { key: 'viewBilling', label: 'View Plan & Billing Quotas' },
  { key: 'deleteWorkspace', label: 'Delete Organization Workspace' },
];

/**
 * Checks whether a role holds a specific permission key.
 * @param {string} roleId
 * @param {string} permissionKey
 * @returns {boolean}
 */
export function hasPermission(roleId, permissionKey) {
  const allowedRoles = PERMISSION_MATRIX[permissionKey];
  if (!allowedRoles) return false;
  return allowedRoles.includes(roleId);
}

/**
 * Returns metadata for the given role id, falling back to viewer.
 * @param {string} roleId
 */
export function getRoleMeta(roleId) {
  return ROLES.find((role) => role.id === roleId) || ROLES[ROLES.length - 1];
}
