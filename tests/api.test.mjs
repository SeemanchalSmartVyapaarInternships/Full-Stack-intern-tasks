import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';

let server;
let baseUrl;
let sequelize;

test.before(async () => {
  const created = createApp({ dialect: 'sqlite', storage: ':memory:' });
  sequelize = created.models.sequelize;
  await sequelize.sync({ force: true });

  server = http.createServer(created.app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

test('creates normalized Department, User, Project, and Task records with 1:N and M:N relationships', async () => {
  const deptRes = await api('/api/departments', {
    method: 'POST',
    body: { name: 'Engineering', code: 'eng', description: 'Platform engineering' },
  });
  assert.equal(deptRes.status, 201);
  assert.equal(deptRes.json.data.code, 'ENG');
  const deptId = deptRes.json.data.id;

  const userRes = await api('/api/users', {
    method: 'POST',
    body: {
      name: 'Priya Nair',
      email: 'priya@ssc.in',
      password: 'Password123',
      role: 'Manager',
      departmentId: deptId,
    },
  });
  assert.equal(userRes.status, 201);
  assert.equal(userRes.json.data.passwordHash, undefined);
  const userId = userRes.json.data.id;

  const projRes = await api('/api/projects', {
    method: 'POST',
    body: { name: 'MedCareX Core', status: 'Active', departmentId: deptId },
  });
  assert.equal(projRes.status, 201);
  const projectId = projRes.json.data.id;

  // Many-to-Many assignment
  const memberRes = await api(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: { userId, roleInProject: 'Tech Lead' },
  });
  assert.equal(memberRes.status, 200);
  assert.equal(memberRes.json.data.teamMembers.length, 1);

  // Create multiple tasks for pagination/filtering/sorting tests
  await api('/api/tasks', {
    method: 'POST',
    body: { title: 'Build Patient API', status: 'In Progress', priority: 'High', projectId, assigneeId: userId },
  });
  await api('/api/tasks', {
    method: 'POST',
    body: { title: 'Setup DB Indexes', status: 'Todo', priority: 'Low', projectId, assigneeId: userId },
  });
  await api('/api/tasks', {
    method: 'POST',
    body: { title: 'Write Auth Tests', status: 'Done', priority: 'High', projectId, assigneeId: userId },
  });

  // Search + filter + pagination + sorting
  const tasksRes = await api('/api/tasks?priority=High&sortBy=title&order=ASC&page=1&limit=1');
  assert.equal(tasksRes.status, 200);
  assert.equal(tasksRes.json.data.length, 1);
  assert.equal(tasksRes.json.data[0].title, 'Build Patient API');
  assert.equal(tasksRes.json.pagination.total, 2);
  assert.equal(tasksRes.json.pagination.totalPages, 2);
});

test('validates required fields and handles updates and deletes cleanly', async () => {
  const invalidUser = await api('/api/users', {
    method: 'POST',
    body: { name: 'Bad', email: 'not-an-email', password: '123' },
  });
  assert.equal(invalidUser.status, 400);

  const dept = await api('/api/departments', {
    method: 'POST',
    body: { name: 'Operations', code: 'OPS' },
  });
  const deptId = dept.json.data.id;

  const updated = await api(`/api/departments/${deptId}`, {
    method: 'PUT',
    body: { description: 'Updated ops description' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.json.data.description, 'Updated ops description');

  const del = await api(`/api/departments/${deptId}`, { method: 'DELETE' });
  assert.equal(del.status, 200);
});
