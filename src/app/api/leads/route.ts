import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations";

export async function POST(request: Request) {
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
  try {
    const response = await fetch(webhook, {
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
