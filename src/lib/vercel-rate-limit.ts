import { checkRateLimit } from "@vercel/firewall";

export async function isVercelRateLimited(request: Request) {
  const rateLimitId = process.env.VERCEL_RATE_LIMIT_ID;
  if (!rateLimitId || process.env.VERCEL !== "1") return false;
  try {
    const result = await checkRateLimit(rateLimitId, { request });
    return result.rateLimited;
  } catch {
    return false;
  }
}
