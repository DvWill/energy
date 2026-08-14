import { expect, test } from "@playwright/test";
import { postInputSchema } from "../src/lib/blog-validation";

function publishableInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Solar",
    slug: "solar",
    summary: "12345678901234567890",
    content: "<p>12345678901234567890</p>",
    status: "PUBLISHED",
    ...overrides,
  };
}

function fieldErrors(input: unknown) {
  const result = postInputSchema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) throw new Error("A validação deveria ter falhado.");
  return result.error.flatten().fieldErrors;
}

test("aceita rascunho incompleto para continuar depois", () => {
  const result = postInputSchema.safeParse({
    title: "Sol",
    slug: "ação",
    summary: "",
    content: "",
    sourceName: "ANEEL",
    coverImageUrl: "/images/capa.webp",
    status: "DRAFT",
  });

  expect(result.success).toBe(true);
  if (!result.success) throw new Error("O rascunho deveria ser aceito.");
  expect(result.data).toMatchObject({
    title: "Sol",
    slug: "acao",
    summary: "",
    content: "",
    sourceName: "ANEEL",
    sourceUrl: null,
    coverImageUrl: "/images/capa.webp",
    coverImageAlt: null,
    status: "DRAFT",
  });
});

test("publicação exige os mínimos editoriais e conta apenas conteúdo visível", () => {
  const titleErrors = fieldErrors(publishableInput({ title: "Sol" }));
  expect(titleErrors.title).toContain(
    "Para publicar, use um título com pelo menos 5 caracteres.",
  );

  const summaryErrors = fieldErrors(
    publishableInput({ summary: "1234567890123456789" }),
  );
  expect(summaryErrors.summary).toContain(
    "Escreva um resumo com pelo menos 20 caracteres.",
  );

  const contentErrors = fieldErrors(
    publishableInput({
      content: "<p><strong>1234567890123456789</strong></p>",
    }),
  );
  expect(contentErrors.content).toContain(
    "Escreva pelo menos 20 caracteres de conteúdo.",
  );

  expect(postInputSchema.safeParse(publishableInput()).success).toBe(true);
});

test("fonte parcial e capa sem texto alternativo bloqueiam a publicação", () => {
  const missingSourceUrl = fieldErrors(
    publishableInput({ sourceName: "ANEEL" }),
  );
  expect(missingSourceUrl.sourceUrl).toContain(
    "Informe o link da notícia original.",
  );

  const missingSourceName = fieldErrors(
    publishableInput({ sourceUrl: "https://www.gov.br/aneel/" }),
  );
  expect(missingSourceName.sourceName).toContain(
    "Informe o nome da fonte da notícia.",
  );

  const missingCoverAlt = fieldErrors(
    publishableInput({ coverImageUrl: "/images/capa.webp" }),
  );
  expect(missingCoverAlt.coverImageAlt).toContain(
    "Descreva a imagem de capa para acessibilidade.",
  );
});

test("aceita capas locais e HTTPS, mas rejeita capa remota HTTP", () => {
  expect(
    postInputSchema.safeParse(
      publishableInput({
        coverImageUrl: "/images/capa.webp",
        coverImageAlt: "Painéis solares no telhado",
      }),
    ).success,
  ).toBe(true);

  expect(
    postInputSchema.safeParse(
      publishableInput({
        coverImageUrl: "https://cdn.example.com/capa.webp",
        coverImageAlt: "Painéis solares no telhado",
      }),
    ).success,
  ).toBe(true);

  const insecureCoverErrors = fieldErrors(
    publishableInput({
      coverImageUrl: "http://cdn.example.com/capa.webp",
      coverImageAlt: "Painéis solares no telhado",
    }),
  );
  expect(insecureCoverErrors.coverImageUrl).toContain(
    "Informe uma imagem local válida ou uma URL HTTPS.",
  );
});

test("datas exigem ISO/RFC3339 com Z ou offset", () => {
  const localPublishedAtErrors = fieldErrors(
    publishableInput({
      status: "DRAFT",
      publishedAt: "2026-08-13T12:34",
    }),
  );
  expect(localPublishedAtErrors.publishedAt).toContain(
    "Informe uma data e hora ISO 8601 com fuso horário (Z ou ±HH:MM).",
  );

  const localScheduledAtErrors = fieldErrors(
    publishableInput({
      status: "DRAFT",
      scheduledAt: "2026-08-13T12:34:56",
    }),
  );
  expect(localScheduledAtErrors.scheduledAt).toContain(
    "Informe uma data e hora ISO 8601 com fuso horário (Z ou ±HH:MM).",
  );

  const result = postInputSchema.safeParse(
    publishableInput({
      status: "DRAFT",
      publishedAt: "2000-01-01T12:34:56Z",
      scheduledAt: "2000-01-01T12:34:56-03:00",
    }),
  );
  expect(result.success).toBe(true);
});

test("agendamento exige data, mas deixa a regra de futuro para a action", () => {
  const missingDate = fieldErrors(
    publishableInput({ status: "SCHEDULED", scheduledAt: "" }),
  );
  expect(missingDate.scheduledAt).toContain(
    "Defina a data e a hora do agendamento.",
  );

  const result = postInputSchema.safeParse(
    publishableInput({
      status: "SCHEDULED",
      scheduledAt: "2000-01-01T00:00:00Z",
    }),
  );
  expect(result.success).toBe(true);
});

test("rejeita publishedAt futuro para uma publicação imediata", () => {
  const futureDate = new Date(Date.now() + 60 * 60_000).toISOString();
  const errors = fieldErrors(publishableInput({ publishedAt: futureDate }));
  expect(errors.publishedAt).toContain(
    "Para publicar no futuro, escolha o status Agendada.",
  );
});

test("normaliza e trunca o slug antes de validar seus limites", () => {
  const result = postInputSchema.safeParse(
    publishableInput({ slug: "Energia São João: Ação & Sol" }),
  );

  expect(result.success).toBe(true);
  if (!result.success) throw new Error("A publicação deveria ser válida.");
  expect(result.data.slug).toBe("energia-sao-joao-acao-sol");

  const longSlug = postInputSchema.safeParse(
    publishableInput({ slug: "Á".repeat(200) }),
  );
  expect(longSlug.success).toBe(true);
  if (!longSlug.success) throw new Error("O slug deveria ser truncado.");
  expect(longSlug.data.slug).toBe("a".repeat(160));

  const shortSlugErrors = fieldErrors(publishableInput({ slug: "Á!?" }));
  expect(shortSlugErrors.slug).toContain(
    "Informe um endereço com pelo menos 3 caracteres.",
  );
});
