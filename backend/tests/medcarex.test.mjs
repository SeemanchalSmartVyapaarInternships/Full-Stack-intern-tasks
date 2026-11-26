import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createMedcarexApp } from '../src/app.js';
import { seedMedcarexData } from '../src/seed.js';

let server;
let baseUrl;
let sequelize;

test.before(async () => {
  const created = createMedcarexApp({ dialect: 'sqlite', storage: ':memory:' });
  sequelize = created.models.sequelize;
  await sequelize.sync({ force: true });
  await seedMedcarexData(created.models);

  server = http.createServer(created.app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

test('authenticates seeded Admin and enforces RBAC on patient deletion and doctor creation', async () => {
  const staffLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'staff@medcarex.in', password: 'DemoPass@123' },
  });
  assert.equal(staffLogin.status, 200);
  const staffToken = staffLogin.json.data.accessToken;

  // Staff cannot create doctors or delete patients
  const docDenied = await api('/api/doctors', {
    method: 'POST',
    token: staffToken,
    body: { name: 'Dr. Test', specialization: 'ENT', licenseNo: 'MCI-9999', departmentId: 1 },
  });
  assert.equal(docDenied.status, 403);

  const delDenied = await api('/api/patients/1', { method: 'DELETE', token: staffToken });
  assert.equal(delDenied.status, 403);
});

test('supports end-to-end patient, doctor, appointment, dashboard summary, and activity log flows', async () => {
  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@medcarex.in', password: 'DemoPass@123' },
  });
  const token = adminLogin.json.data.accessToken;

  // Create doctor
  const docRes = await api('/api/doctors', {
    method: 'POST',
    token,
    body: { name: 'Dr. Suman Gupta', specialization: 'Neurology', licenseNo: 'MCI-77412', departmentId: 1 },
  });
  assert.equal(docRes.status, 201);

  // Create & search patient
  const patRes = await api('/api/patients', {
    method: 'POST',
    token,
    body: {
      fullName: 'Kiran Devi',
      age: 45,
      gender: 'Female',
      phone: '+91-9000112233',
      bloodGroup: 'O+',
      primaryDoctorId: docRes.json.data.id,
    },
  });
  assert.equal(patRes.status, 201);

  const searchRes = await api('/api/patients?search=Kiran', { token });
  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.json.data.length, 1);

  // Book & complete appointment
  const apptRes = await api('/api/appointments', {
    method: 'POST',
    token,
    body: {
      patientId: patRes.json.data.id,
      doctorId: docRes.json.data.id,
      scheduledAt: '2026-11-28 11:00',
      reason: 'Migraine evaluation',
    },
  });
  assert.equal(apptRes.status, 201);

  const patchAppt = await api(`/api/appointments/${apptRes.json.data.id}`, {
    method: 'PATCH',
    token,
    body: { status: 'Completed' },
  });
  assert.equal(patchAppt.status, 200);
  assert.equal(patchAppt.json.data.status, 'Completed');

  // Dashboard summary & activity log check
  const summaryRes = await api('/api/dashboard/summary', { token });
  assert.equal(summaryRes.status, 200);
  assert.ok(summaryRes.json.data.kpis.totalPatients >= 5);
  assert.ok(summaryRes.json.data.recentActivity.length > 0);
});
