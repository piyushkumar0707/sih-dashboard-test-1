import os from 'node:os';
import { performance } from 'node:perf_hooks';

const baseUrl = (process.env.BENCH_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const usernames = (process.env.BENCH_USERNAMES || process.env.BENCH_USERNAME || '')
  .split(',').map((username) => username.trim()).filter(Boolean);
const password = process.env.BENCH_PASSWORD;
const concurrency = Number.parseInt(process.env.BENCH_CONCURRENCY || '1', 10);
const durationSeconds = Number.parseInt(process.env.BENCH_DURATION_SECONDS || '30', 10);
const requestTimeoutMs = Number.parseInt(process.env.BENCH_REQUEST_TIMEOUT_MS || '30000', 10);

if (!usernames.length || !password) throw new Error('Set BENCH_USERNAMES (comma-separated) or BENCH_USERNAME, and BENCH_PASSWORD');
if (new Set(usernames).size !== usernames.length) throw new Error('BENCH_USERNAMES must not contain duplicates');
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 256) throw new Error('BENCH_CONCURRENCY must be an integer from 1 to 256');
if (!Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 3600) throw new Error('BENCH_DURATION_SECONDS must be an integer from 1 to 3600');

const tokens = [];
for (const username of usernames) {
  const login = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!login.ok) throw new Error(`Login failed with HTTP ${login.status}; check account ${username} and API URL`);
  const { token } = await login.json();
  if (!token) throw new Error(`Login response for ${username} did not include a JWT`);
  tokens.push(token);
}

const latenciesMs = [];
const successfulLatenciesMs = [];
let failures = 0;
let started = 0;
const failureGroups = new Map();
const usedAccountIndexes = new Set();
const requestBody = JSON.stringify({
  lat: 28.6139,
  lng: 77.2090,
  accuracy: 5,
  timestamp: new Date().toISOString(),
});
const deadline = performance.now() + durationSeconds * 1000;

async function worker() {
  while (performance.now() < deadline) {
    const start = performance.now();
    const accountIndex = started % tokens.length;
    started += 1;
    usedAccountIndexes.add(accountIndex);
    try {
      const response = await fetch(`${baseUrl}/api/mobile/location/update`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${tokens[accountIndex]}`,
        },
        body: requestBody,
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const body = await response.json().catch(() => null);
      latenciesMs.push(performance.now() - start);
      if (!response.ok || body?.success !== true) {
        failures += 1;
        const reason = `HTTP ${response.status} ${body?.code || body?.error || 'unsuccessful response'}`;
        failureGroups.set(reason, (failureGroups.get(reason) || 0) + 1);
      } else successfulLatenciesMs.push(latenciesMs.at(-1));
    } catch (error) {
      latenciesMs.push(performance.now() - start);
      failures += 1;
      const reason = `request error: ${error.name}`;
      failureGroups.set(reason, (failureGroups.get(reason) || 0) + 1);
    }
  }
}

const measuredStart = performance.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const measuredSeconds = (performance.now() - measuredStart) / 1000;

function percentile(values, percent) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil((percent / 100) * sorted.length) - 1);
  return sorted[index];
}

const successes = started - failures;
console.log(JSON.stringify({
  benchmark: 'authenticated location update end-to-end',
  baseUrl,
  accountCount: usernames.length,
  distinctAccountsUsed: usedAccountIndexes.size,
  requestedDurationSeconds: durationSeconds,
  measuredDurationSeconds: measuredSeconds,
  concurrency,
  totalRequests: started,
  successfulRequests: successes,
  failedRequests: failures,
  failureReasons: Object.fromEntries(failureGroups),
  errorRatePercent: started ? (failures / started) * 100 : 0,
  successRatePercent: started ? (successes / started) * 100 : 0,
  successfulRequestsPerSecond: successes / measuredSeconds,
  latencyMs: {
    successfulResponses: {
      p50: percentile(successfulLatenciesMs, 50),
      p95: percentile(successfulLatenciesMs, 95),
      p99: percentile(successfulLatenciesMs, 99),
    },
    allResponses: {
      p50: percentile(latenciesMs, 50),
      p95: percentile(latenciesMs, 95),
      p99: percentile(latenciesMs, 99),
    },
  },
  client: {
    os: `${os.type()} ${os.release()}`,
    architecture: os.arch(),
    cpuLogicalCores: os.cpus().length,
    memoryBytes: os.totalmem(),
    nodeVersion: process.version,
  },
}, null, 2));

if (failures > 0 || started === 0) process.exitCode = 1;
