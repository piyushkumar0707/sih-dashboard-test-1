const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { after, before, describe, test } = require('node:test');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

const User = require('../models/User');
const Tourist = require('../models/Tourist');
const Incident = require('../models/Incident');

const mongoUri = process.env.MONGODB_URI;
const secret = process.env.JWT_SECRET || 'integration-test-secret-at-least-32-chars';
const port = Number(process.env.TEST_PORT || 5057);
const baseUrl = `http://127.0.0.1:${port}`;
const backendDir = path.resolve(__dirname, '..');
const userIds = [];
const incidentIds = [];
let backend;
let backendOutput = '';

function signToken(role, overrides = {}) {
  return jwt.sign({
    userId: new mongoose.Types.ObjectId().toString(),
    username: `it_${role}`,
    role,
    status: 'active',
    ...overrides,
  }, secret, { expiresIn: overrides.expiresIn || '5m' });
}

async function api(route, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { response, body: await response.json() };
}

async function registerTourist(label) {
  const username = `it_${label}_${new mongoose.Types.ObjectId().toString().slice(-8)}`;
  const result = await api('/api/register', {
    method: 'POST',
    body: { username, email: `${username}@example.test`, password: 'Integration-Pass-123!' },
  });
  assert.equal(result.response.status, 201, JSON.stringify(result.body));
  userIds.push(new mongoose.Types.ObjectId(result.body.user.id));
  return { ...result.body, username };
}

function connectSocket(token) {
  const socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
    timeout: 3000,
  });
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Socket connection timed out')), 4000);
    socket.once('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.once('connect_error', (error) => {
      clearTimeout(timeout);
      socket.close();
      reject(error);
    });
  });
}

function nextSocketEvent(socket, name) {
  const observed = [];
  socket.onAny((eventName) => observed.push(eventName));
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(
      `Timed out waiting for ${name}; received [${observed.join(', ')}]. Backend log:\n${backendOutput}`
    )), 8000);
    socket.once(name, (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });
}

describe('Node API integration', { concurrency: false }, () => {
  before(async () => {
    assert.ok(mongoUri, 'MONGODB_URI must point to a disposable MongoDB database');
    await mongoose.connect(mongoUri);
    backend = spawn(process.execPath, ['index.js'], {
      cwd: backendDir,
      env: {
        ...process.env,
        PORT: String(port),
        JWT_SECRET: secret,
        MONGODB_URI: mongoUri,
        AI_SAFETY_SCORE_URL: process.env.AI_SAFETY_SCORE_URL || 'http://127.0.0.1:8001',
        AI_CASE_REPORT_URL: process.env.AI_CASE_REPORT_URL || 'http://127.0.0.1:8002',
        BLOCKCHAIN_API_URL: 'http://127.0.0.1:1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    backend.stdout.on('data', (chunk) => { backendOutput += chunk.toString(); });
    backend.stderr.on('data', (chunk) => { backendOutput += chunk.toString(); });

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      if (backend.exitCode !== null) throw new Error(`Backend exited early:\n${backendOutput}`);
      if (backendOutput.includes('Connected to MongoDB Atlas successfully')) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error(`Backend did not connect to MongoDB:\n${backendOutput}`);
  });

  after(async () => {
    for (const socket of activeSockets) socket.close();
    if (userIds.length) {
      await Promise.all([
        User.deleteMany({ _id: { $in: userIds } }),
        Tourist.deleteMany({ userId: { $in: userIds } }),
      ]);
    }
    if (incidentIds.length) await Incident.deleteMany({ incidentId: { $in: incidentIds } });
    if (backend && backend.exitCode === null) {
      backend.kill('SIGTERM');
      await new Promise((resolve) => backend.once('exit', resolve));
    }
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });

  const activeSockets = new Set();
  const trackSocket = (socket) => {
    activeSockets.add(socket);
    socket.once('disconnect', () => activeSockets.delete(socket));
    return socket;
  };

  test('auth matrix: missing token returns 401', async () => {
    const { response, body } = await api('/api/tourists');
    assert.equal(response.status, 401);
    assert.deepEqual([body.code, typeof body.error], ['UNAUTHENTICATED', 'string']);
  });

  test('auth matrix: invalid token returns 401', async () => {
    const { response, body } = await api('/api/tourists', { token: 'not-a-jwt' });
    assert.equal(response.status, 401);
    assert.deepEqual([body.code, typeof body.error], ['UNAUTHENTICATED', 'string']);
  });

  test('auth matrix: expired token returns 401', async () => {
    const token = jwt.sign({ userId: 'expired', username: 'expired', role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 }, secret);
    const { response, body } = await api('/api/tourists', { token });
    assert.equal(response.status, 401);
    assert.deepEqual([body.code, typeof body.error], ['UNAUTHENTICATED', 'string']);
  });

  test('auth matrix: wrong role returns 403', async () => {
    const { response, body } = await api('/api/tourists', { token: signToken('tourist') });
    assert.equal(response.status, 403);
    assert.deepEqual([body.code, typeof body.error], ['FORBIDDEN', 'string']);
  });

  test('auth matrix: valid admin token is accepted', async () => {
    const { response } = await api('/api/tourists', { token: signToken('admin') });
    assert.equal(response.status, 200);
  });

  test('public registration cannot create an admin', async () => {
    const username = `it_escalation_${new mongoose.Types.ObjectId().toString().slice(-8)}`;
    const { response, body } = await api('/api/register', {
      method: 'POST',
      body: { username, email: `${username}@example.test`, password: 'Integration-Pass-123!', role: 'admin' },
    });
    assert.equal(response.status, 201, JSON.stringify(body));
    assert.equal(body.user.role, 'tourist');
    const createdId = new mongoose.Types.ObjectId(body.user.id);
    userIds.push(createdId);
    assert.equal((await User.findById(createdId).lean()).role, 'tourist');
  });

  test('invalid location input returns 400 with {error, code}', async () => {
    const tourist = await registerTourist('validation');
    const { response, body } = await api('/api/mobile/location/update', {
      method: 'POST', token: tourist.token, body: { lat: 91, lng: 10 },
    });
    assert.equal(response.status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.equal(typeof body.error, 'string');
  });

  test('location update persists score/history and emits to authenticated staff', async () => {
    const tourist = await registerTourist('location');
    const staffSocket = trackSocket(await connectSocket(signToken('admin')));
    const event = nextSocketEvent(staffSocket, 'tourist:location');
    const { response, body } = await api('/api/mobile/location/update', {
      method: 'POST', token: tourist.token,
      body: { lat: 28.6139, lng: 77.209, accuracy: 4, timestamp: new Date().toISOString() },
    });
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.success, true);
    const eventData = await event;
    assert.equal(eventData.userId, tourist.user.id);
    const saved = await Tourist.findOne({ userId: tourist.user.id }).lean();
    assert.ok(saved, 'tourist location must be persisted');
    assert.equal(saved.location.lat, 28.6139);
    assert.equal(saved.location.lng, 77.209);
    assert.equal(saved.safetyScore, body.tourist.safetyScore);
    assert.ok(saved.scoreHistory.length >= 1, 'score history must be persisted');
    assert.equal(saved.scoreHistory.at(-1).score, saved.safetyScore);
  });

  test('unauthenticated Socket.IO client is rejected', async () => {
    const socket = io(baseUrl, { auth: {}, transports: ['websocket'], reconnection: false, timeout: 3000 });
    const error = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Unauthenticated socket was not rejected')), 4000);
      socket.once('connect_error', (err) => {
        clearTimeout(timeout);
        resolve(err);
      });
      socket.once('connect', () => {
        clearTimeout(timeout);
        reject(new Error('Unauthenticated socket connected'));
      });
    });
    socket.close();
    assert.match(error.message, /Unauthorized/);
  });

  test('panic flow persists an emergency incident and emits the staff event', async () => {
    const tourist = await registerTourist('panic');
    const staffSocket = trackSocket(await connectSocket(signToken('officer')));
    const event = nextSocketEvent(staffSocket, 'alert:panic');
    const { response, body } = await api('/api/mobile/panic/alert', {
      method: 'POST', token: tourist.token,
      body: { lat: 19.076, lng: 72.8777, message: 'integration panic flow' },
    });
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.success, true);
    incidentIds.push(body.incidentId);
    const eventData = await event;
    assert.equal(eventData.incident.incidentId, body.incidentId);
    const savedIncident = await Incident.findOne({ incidentId: body.incidentId }).lean();
    assert.equal(savedIncident.type, 'Emergency Alert');
    assert.equal(savedIncident.description, 'integration panic flow');
    assert.equal(savedIncident.status, 'Open');
  });
});
