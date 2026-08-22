import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/db/queries";
import { publicQuerySchema } from "@/lib/blog-validation";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
import { isVercelRateLimited } from "@/lib/vercel-rate-limit";
export async function GET(request: Request) {
  if (await isVercelRateLimited(request)) return NextResponse.json({ message: "Muitas solicitações." }, { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } });
  const ip = clientAddress(request.headers);
  if (!rateLimit(`blog:${ip}`, 60)) return NextResponse.json({ message: "Muitas solicitações." }, { status: 429 });
  const url = new URL(request.url); const parsed = publicQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ message: "Parâmetros inválidos." }, { status: 400 });
  try { return NextResponse.json(await listPublishedPosts(parsed.data), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }); }
  catch { return NextResponse.json({ message: "Não foi possível carregar as publicações." }, { status: 503 }); }
}
