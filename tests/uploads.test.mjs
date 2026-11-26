import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

let server;
let baseUrl;
let sequelize;
let tempUploadDir;

test.before(async () => {
  tempUploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ssc-week4-uploads-'));
  const created = createApp({
    dbOverrides: { dialect: 'sqlite', storage: ':memory:' },
    uploadDir: tempUploadDir,
  });
  sequelize = created.models.sequelize;
  await sequelize.sync({ force: true });

  server = http.createServer(created.app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  await fs.rm(tempUploadDir, { recursive: true, force: true });
});

test('uploads valid PNG profile image, logs upload history, and records login/task events', async () => {
  const form = new FormData();
  form.append('uploadedBy', 'harsha@ssc.in');
  form.append('file', new Blob([Buffer.from('fake-png-bytes')], { type: 'image/png' }), 'avatar.png');

  const res = await fetch(`${baseUrl}/api/uploads/profile-image`, { method: 'POST', body: form });
  const json = await res.json();
  assert.equal(res.status, 201);
  assert.equal(json.data.category, 'profile-image');
  assert.equal(json.data.storageProvider, 'local-fallback');

  // Record login & task update activity
  const loginRes = await fetch(`${baseUrl}/api/activity/login-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: 'harsha@ssc.in', status: 'SUCCESS' }),
  });
  assert.equal(loginRes.status, 201);

  const taskRes = await fetch(`${baseUrl}/api/activity/task-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: 'harsha@ssc.in', taskId: 12, fromStatus: 'Todo', toStatus: 'Done' }),
  });
  assert.equal(taskRes.status, 201);

  const activityRes = await fetch(`${baseUrl}/api/activity`);
  const activityJson = await activityRes.json();
  assert.equal(activityRes.status, 200);
  assert.equal(activityJson.data.length, 3);
});

test('rejects disallowed MIME types and oversized profile images', async () => {
  const badForm = new FormData();
  badForm.append('file', new Blob([Buffer.from('plain text')], { type: 'text/plain' }), 'notes.txt');
  const badRes = await fetch(`${baseUrl}/api/uploads/profile-image`, { method: 'POST', body: badForm });
  assert.equal(badRes.status, 400);

  const bigBuffer = Buffer.alloc(2 * 1024 * 1024 + 50, 1);
  const bigForm = new FormData();
  bigForm.append('file', new Blob([bigBuffer], { type: 'image/png' }), 'huge.png');
  const bigRes = await fetch(`${baseUrl}/api/uploads/profile-image`, { method: 'POST', body: bigForm });
  assert.equal(bigRes.status, 400);

  const docForm = new FormData();
  docForm.append('projectId', 'PRJ-1');
  docForm.append('file', new Blob([Buffer.from('%PDF-1.4 spec')], { type: 'application/pdf' }), 'spec.pdf');
  const docRes = await fetch(`${baseUrl}/api/uploads/project-document`, { method: 'POST', body: docForm });
  assert.equal(docRes.status, 201);
});
