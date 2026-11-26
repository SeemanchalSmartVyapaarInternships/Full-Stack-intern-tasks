import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { findUserByEmail, resetUserStore } from '../src/models/userStore.js';

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(() => {
  resetUserStore();
});

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, json };
}

test('registers user with bcrypt hash (never plaintext) and blocks duplicate emails', async () => {
  const res1 = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Ayesha Khan',
      email: 'ayesha@company.in',
      password: 'StrongPassword123',
      role: 'Manager',
    },
  });

  assert.equal(res1.status, 201);
  assert.equal(res1.json.success, true);
  assert.ok(res1.json.data.accessToken);
  assert.equal(res1.json.data.user.passwordHash, undefined);

  const stored = findUserByEmail('ayesha@company.in');
  assert.ok(stored.passwordHash.startsWith('$2'));
  assert.notEqual(stored.passwordHash, 'StrongPassword123');

  const resDup = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Ayesha Duplicate',
      email: 'ayesha@company.in',
      password: 'StrongPassword123',
    },
  });
  assert.equal(resDup.status, 409);
});

test('logs in with valid credentials and rejects invalid password', async () => {
  await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Rohan', email: 'rohan@company.in', password: 'SecretPassword9', role: 'Employee' },
  });

  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'rohan@company.in', password: 'WrongPassword' },
  });
  assert.equal(badLogin.status, 401);

  const goodLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'rohan@company.in', password: 'SecretPassword9' },
  });
  assert.equal(goodLogin.status, 200);
  assert.ok(goodLogin.json.data.accessToken);
});

test('enforces JWT authentication and Admin/Manager/Employee RBAC on protected routes', async () => {
  const unauth = await request('/api/auth/me');
  assert.equal(unauth.status, 401);

  const empRes = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Emp User', email: 'emp@company.in', password: 'Password123', role: 'Employee' },
  });
  const mgrRes = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Mgr User', email: 'mgr@company.in', password: 'Password123', role: 'Manager' },
  });
  const admRes = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Adm User', email: 'adm@company.in', password: 'Password123', role: 'Admin' },
  });

  const empToken = empRes.json.data.accessToken;
  const mgrToken = mgrRes.json.data.accessToken;
  const admToken = admRes.json.data.accessToken;

  // Employee access
  assert.equal((await request('/api/resources/employee', { token: empToken })).status, 200);
  assert.equal((await request('/api/resources/manager', { token: empToken })).status, 403);
  assert.equal((await request('/api/resources/admin', { token: empToken })).status, 403);

  // Manager access
  assert.equal((await request('/api/resources/employee', { token: mgrToken })).status, 200);
  assert.equal((await request('/api/resources/manager', { token: mgrToken })).status, 200);
  assert.equal((await request('/api/resources/admin', { token: mgrToken })).status, 403);

  // Admin access & user role management
  assert.equal((await request('/api/resources/admin', { token: admToken })).status, 200);
  assert.equal((await request('/api/auth/users', { token: admToken })).status, 200);
});
