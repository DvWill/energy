const buckets = new Map<string, { count: number; reset: number }>();
const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let nextSweep = 0;

type HeaderReader = { get(name: string): string | null };

function sweepExpired(now: number) {
  if (now < nextSweep && buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.reset <= now) buckets.delete(key);
  }
  nextSweep = now + SWEEP_INTERVAL_MS;
}

function normalizeAddress(value: string | null) {
  const address = value?.split(",", 1)[0]?.trim() ?? "";
  return /^[0-9a-f:.]{1,64}$/i.test(address) ? address : "unknown";
}

export function clientAddress(headers: HeaderReader) {
  const value = process.env.VERCEL === "1"
    ? headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for")
    : headers.get("x-forwarded-for") ?? headers.get("x-real-ip");
  return normalizeAddress(value);
}

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  sweepExpired(now);
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    if (buckets.size >= MAX_BUCKETS) return false;
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
