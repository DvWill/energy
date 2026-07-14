import { expect, test } from "@playwright/test";

test("renderiza sem erros de console ou hidratação", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(250);
  expect(errors).toEqual([]);
});

test("jornada essencial da landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Energia inteligente",
  );
  await expect(
    page.getByRole("link", { name: "Solicitar uma proposta" }).first(),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "FAQ" })
    .click();
  await expect(page).toHaveURL(/#faq/);
  const faq = page.getByRole("button", { name: "O que a Energy oferece?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
});

test("menu mobile abre e fecha após navegação", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Ativar modo (claro|escuro)/ }),
  ).toBeVisible();
  const menu = page.locator(".menu-button");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.locator(".mobile-nav").getByRole("link", { name: "FAQ" }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByRole("navigation", { name: "Menu mobile" })
    .getByRole("link", { name: "Quem somos" })
    .click();
  await expect(page).toHaveURL(/#quem-somos/);
  await expect(
    page.getByRole("button", { name: "Abrir menu" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("alterna o tema e preserva a escolha após recarregar", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(6, 21, 34)",
  );

  await page.getByRole("button", { name: "Ativar modo claro" }).click();
  await expect(root).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Ativar modo escuro" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
});

test("prefers-reduced-motion remove parallax, stagger e movimento contínuo", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const reveal = page.locator("[data-motion-reveal]").first();
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveCSS("opacity", "1");

  const symbol = page.locator(".hero-logo-ghost");
  const before = await symbol.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(100);
  const after = await symbol.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(after).toBe(before);

  const faq = page.getByRole("button", { name: "Como começa o atendimento?" });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "Como começa o atendimento?" }),
  ).toBeVisible();
});

test("conteúdo essencial e navegação permanecem acessíveis sem JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Menu mobile" }).getByRole("link", {
      name: "FAQ",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Os dados são enviados apenas ao endpoint configurado"),
  ).toBeVisible();

  await context.close();
});

test("links legais levam às páginas publicadas", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacidade" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Política de privacidade",
  );
  await page.getByRole("link", { name: "Voltar" }).click();
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Termos de uso" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Termos de uso",
  );
});

test("API de leads rejeita formato e payload acima do limite", async ({
  request,
}) => {
  const wrongType = await request.post("/api/leads", { data: "invalid" });
  expect(wrongType.status()).toBe(415);

  const oversized = await request.post("/api/leads", {
    headers: { "content-type": "application/json" },
    data: { message: "x".repeat(33_000) },
  });
  expect(oversized.status()).toBe(413);
});

test("BLOG aparece após FAQ e abre a página pública", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const links = await navigation.getByRole("link").allTextContents();
  expect(links.indexOf("BLOG")).toBe(links.indexOf("FAQ") + 1);
  await navigation.getByRole("link", { name: "BLOG" }).click();
  await expect(page).toHaveURL(/\/blog/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Informação para transformar energia.",
    }),
  ).toBeVisible();
});

test("painel do blog exige autenticação", async ({ page }) => {
  await page.goto("/admin/blog");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Acesso administrativo" }),
  ).toBeVisible();
});

for (const width of [320, 360, 768, 1024, 1440]) {
  test(`não apresenta overflow horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });
}
