import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, getRoleMeta, hasPermission } from '../src/lib/permissions.js';
import {
  buildActivityCsv,
  computeUsagePercent,
  csvEscape,
  formatCompactNumber,
  formatCurrency,
} from '../src/lib/formatters.js';
import { INITIAL_TENANTS } from '../src/data/mockTenants.js';

test('RBAC permissions enforce least privilege across roles', () => {
  assert.equal(hasPermission('owner', 'createTenant'), true);
  assert.equal(hasPermission('owner', 'editRoles'), true);
  assert.equal(hasPermission('admin', 'createTenant'), false);
  assert.equal(hasPermission('admin', 'manageTeam'), true);
  assert.equal(hasPermission('manager', 'approveTasks'), true);
  assert.equal(hasPermission('manager', 'editSettings'), false);
  assert.equal(hasPermission('viewer', 'viewDashboard'), true);
  assert.equal(hasPermission('viewer', 'viewOrganizations'), false);
  assert.equal(hasPermission('viewer', 'exportAudit'), false);
  assert.equal(hasPermission('owner', 'nonexistentPermission'), false);
});

test('getRoleMeta returns matching role metadata and falls back to viewer', () => {
  assert.equal(getRoleMeta('owner').label, 'Owner');
  assert.equal(getRoleMeta('admin').label, 'Tenant Admin');
  assert.equal(getRoleMeta('unknown-role').id, ROLES[ROLES.length - 1].id);
});

test('formatters compute usage percentages, compact numbers, and CSV safely', () => {
  assert.equal(computeUsagePercent(78, 100), 78);
  assert.equal(computeUsagePercent(150, 100), 100);
  assert.equal(computeUsagePercent(10, 0), 0);
  assert.match(formatCurrency(485000, 'INR'), /4,85,000/);
  assert.equal(formatCompactNumber(1420000), '1.4M');
  assert.equal(csvEscape('hello, "world"'), '"hello, ""world"""');

  const csv = buildActivityCsv(INITIAL_TENANTS[0].activities.slice(0, 1));
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^ID,Actor,Role,Action,Resource,Category,Status,Timestamp,IP Address$/);
});

test('mockTenants contains valid multi-tenant datasets for 3 organizations', () => {
  assert.equal(INITIAL_TENANTS.length, 3);
  for (const tenant of INITIAL_TENANTS) {
    assert.ok(tenant.id && tenant.name && tenant.plan);
    assert.equal(tenant.kpis.length, 4);
    assert.ok(Array.isArray(tenant.revenueSeries['7d']) && tenant.revenueSeries['7d'].length === 7);
    assert.ok(Array.isArray(tenant.revenueSeries['30d']) && tenant.revenueSeries['30d'].length === 4);
    assert.ok(Array.isArray(tenant.revenueSeries['90d']) && tenant.revenueSeries['90d'].length === 3);
    assert.ok(tenant.activities.length > 0);
    assert.ok(tenant.notifications.length > 0);
    assert.ok(tenant.members.length > 0);
  }
});
