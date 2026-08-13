import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/db/queries";
import { publicQuerySchema } from "@/lib/blog-validation";
import { rateLimit } from "@/lib/rate-limit";
export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`blog:${ip}`, 60)) return NextResponse.json({ message: "Muitas solicitações." }, { status: 429 });
  const url = new URL(request.url); const parsed = publicQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ message: "Parâmetros inválidos." }, { status: 400 });
  try { return NextResponse.json(await listPublishedPosts(parsed.data), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }); }
  catch { return NextResponse.json({ message: "Não foi possível carregar as publicações." }, { status: 503 }); }
}
