import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const benchmarkScript = path.join(scriptDir, 'location-update.mjs');
const usernames = (process.env.BENCH_USERNAMES || '').split(',').map((name) => name.trim()).filter(Boolean);
const password = process.env.BENCH_PASSWORD;

if (new Set(usernames).size < 20) throw new Error('Set BENCH_USERNAMES to at least 20 distinct tourist usernames');
if (!password) throw new Error('Set BENCH_PASSWORD for the benchmark tourist accounts');

const startedAt = new Date().toISOString();
const results = [];
let anyFailures = false;

for (const concurrency of [1, 5, 10, 30]) {
  for (const run of [1, 2, 3]) {
    console.error(`Running concurrency=${concurrency}, run=${run}/3 for 30 seconds`);
    const child = spawnSync(process.execPath, [benchmarkScript], {
      encoding: 'utf8',
      timeout: 180000,
      env: {
        ...process.env,
        BENCH_USERNAMES: usernames.join(','),
        BENCH_PASSWORD: password,
        BENCH_CONCURRENCY: String(concurrency),
        BENCH_DURATION_SECONDS: '30',
      },
      maxBuffer: 2 * 1024 * 1024,
    });

    let measurement;
    try {
      measurement = JSON.parse(child.stdout.trim());
    } catch {
      throw new Error(`Run failed before returning measurement JSON (c=${concurrency}, run=${run}): ${child.error?.message || child.stderr || child.stdout}`);
    }
    const entry = { run, exitCode: child.status, ...measurement };
    results.push(entry);
    if (child.status !== 0 || measurement.failedRequests > 0) anyFailures = true;
    console.error(`  requests=${measurement.totalRequests} success=${measurement.successRatePercent}% req/s=${measurement.successfulRequestsPerSecond} p95=${measurement.latencyMs.successfulResponses.p95}ms failures=${measurement.failedRequests}`);
  }
}

const outputPath = process.env.BENCH_RESULTS_PATH || path.join(scriptDir, `results-local-compose-${startedAt.slice(0, 10)}.json`);
const rawResults = {
  benchmark: 'authenticated location update end-to-end',
  environment: process.env.BENCH_ENVIRONMENT || 'API-level, local Compose; no deployed benchmark',
  startedAt,
  completedAt: new Date().toISOString(),
  requiredConcurrencyLevels: [1, 5, 10, 30],
  runsPerLevel: 3,
  durationSecondsPerRun: 30,
  accountCount: usernames.length,
  dockerEngine: process.env.BENCH_DOCKER_INFO || null,
  serviceVersions: process.env.BENCH_SERVICE_VERSIONS || null,
  runs: results,
};
writeFileSync(outputPath, `${JSON.stringify(rawResults, null, 2)}\n`);
console.log(JSON.stringify({
  outputPath,
  runCount: results.length,
  failedRuns: results.filter((entry) => entry.failedRequests > 0).length,
  accountCount: usernames.length,
  durationSecondsPerRun: 30,
}, null, 2));

if (anyFailures) process.exitCode = 1;
