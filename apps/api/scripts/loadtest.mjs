import { performance } from "node:perf_hooks";

const BASE_URL = process.env.LOADTEST_BASE_URL ?? "http://localhost:4000";
const TOTAL_REQUESTS = Number(process.env.LOADTEST_REQUESTS ?? 50);
const CONCURRENCY = Number(process.env.LOADTEST_CONCURRENCY ?? 5);

const targets = [
  { name: "health", method: "GET", path: "/health" },
  { name: "courses", method: "GET", path: "/api/v1/courses?page=1&pageSize=6" },
];

const percentile = (samples, percentileValue) => {
  if (samples.length === 0) {
    return 0;
  }
  const sorted = samples.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  const safeIndex = Math.min(Math.max(index, 0), sorted.length - 1);
  return sorted[safeIndex];
};

const runScenario = async (target) => {
  const requestsPerWorker = Math.ceil(TOTAL_REQUESTS / CONCURRENCY);
  const durations = [];
  let errors = 0;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let i = 0; i < requestsPerWorker; i += 1) {
      const start = performance.now();
      try {
        const response = await fetch(`${BASE_URL}${target.path}`, {
          method: target.method,
        });
        await response.text();
        if (!response.ok) {
          errors += 1;
        }
      } catch (error) {
        errors += 1;
      }
      const durationMs = performance.now() - start;
      durations.push(durationMs);
    }
  });

  await Promise.all(workers);

  const average =
    durations.reduce((sum, value) => sum + value, 0) / Math.max(durations.length, 1);

  return {
    target: target.name,
    requests: durations.length,
    errors,
    p50Ms: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    avgMs: average,
    maxMs: durations.length ? Math.max(...durations) : 0,
  };
};

const main = async () => {
  console.log(`Running load test against ${BASE_URL}`);
  console.log(`Requests per target: ${TOTAL_REQUESTS}, concurrency: ${CONCURRENCY}`);

  for (const target of targets) {
    const result = await runScenario(target);
    console.log(`\n[${result.target}]`);
    console.log(`requests: ${result.requests}, errors: ${result.errors}`);
    console.log(`p50: ${result.p50Ms.toFixed(1)}ms`);
    console.log(`p95: ${result.p95Ms.toFixed(1)}ms`);
    console.log(`avg: ${result.avgMs.toFixed(1)}ms`);
    console.log(`max: ${result.maxMs.toFixed(1)}ms`);
  }
};

main().catch((error) => {
  console.error("Load test failed", error);
  process.exit(1);
});
