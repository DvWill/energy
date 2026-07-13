import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";

const MAX_BODY_BYTES = 32_000;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json(
      { message: "Envie os dados no formato JSON." },
      { status: 415 },
    );
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES)
    return NextResponse.json(
      { message: "A solicitação excede o tamanho permitido." },
      { status: 413 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        message: "Revise os campos informados.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  if (parsed.data.website)
    return NextResponse.json({ message: "Solicitação recebida." });
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook)
    return NextResponse.json(
      {
        message:
          "O canal de envio ainda não está configurado. Entre em contato pelos canais publicados pela Energy.",
      },
      { status: 503 },
    );
  let webhookUrl: URL;
  try {
    webhookUrl = new URL(webhook);
    if (
      webhookUrl.protocol !== "https:" ||
      webhookUrl.username ||
      webhookUrl.password
    )
      throw new Error("invalid webhook");
  } catch {
    return NextResponse.json(
      { message: "O canal de envio está configurado de forma inválida." },
      { status: 503 },
    );
  }
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...parsed.data,
        website: undefined,
        source: "landing-page",
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("webhook");
    return NextResponse.json({
      message:
        "Mensagem enviada. A equipe Energy retornará assim que possível.",
    });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível enviar agora. Tente novamente mais tarde." },
      { status: 502 },
    );
  }
}
