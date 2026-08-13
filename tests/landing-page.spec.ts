import { expect, test, type Locator, type Page } from "@playwright/test";

const calculatorLabels = {
  monthlyBill: "Valor médio mensal da conta de energia em reais",
  slider: "Ajustar valor médio mensal da conta de energia",
  calculate: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE",
} as const;

const chatLabels = {
  trigger: "Abrir conversa para fazer uma simulação",
  dialog: "Conversa para simulação de energia solar",
} as const;

function currencyPattern(value: number) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
  return new RegExp(
    formatted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*"),
  );
}

function watchRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function configureCalculator(
  page: Page,
  monthlyBill = 1_000,
  horizon: 1 | 5 | 10 | 25 = 5,
) {
  const calculator = page.locator("#calculadora");
  const input = calculator.getByLabel(calculatorLabels.monthlyBill);
  await input.fill(String(monthlyBill));
  await input.blur();
  await expect(input).toHaveValue(currencyPattern(monthlyBill));

  const horizonButton = calculator.getByRole("button", {
    name: `${horizon} ${horizon === 1 ? "ano" : "anos"}`,
    exact: true,
  });
  await horizonButton.click();
  await expect(horizonButton).toHaveAttribute("aria-pressed", "true");
  return calculator;
}

async function revealCalculatorResult(page: Page) {
  const calculator = page.locator("#calculadora");
  await calculator
    .getByRole("button", { name: calculatorLabels.calculate })
    .click();
  const result = calculator.locator('[data-calculator-result="visible"]');
  await expect(result).toBeVisible();
  return result;
}

async function openFloatingChat(page: Page) {
  const trigger = page.getByRole("button", { name: chatLabels.trigger });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: chatLabels.dialog });
  await expect(dialog).toBeVisible();
  return { dialog, trigger };
}

async function startChat(dialog: Locator) {
  await expect(
    dialog.getByText(/Olá! Eu sou o assistente da ENERGY/),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  const monthlyBill = dialog.getByLabel("Valor médio da conta de luz");
  await expect(monthlyBill).toBeVisible();
  return monthlyBill;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      ),
    )
    .toBe(false);
}

test("renderiza sem erros de console ou hidratação", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('[data-model-loaded="true"]')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator(".hero-logo-model-fallback")).toHaveCount(0);

  await configureCalculator(page);
  const result = await revealCalculatorResult(page);
  await result
    .getByRole("button", { name: "Quero descobrir quanto posso economizar" })
    .click();
  const dialog = page.getByRole("dialog", { name: chatLabels.dialog });
  await expect(dialog).toHaveAttribute("data-motion", "reduced");
  const monthlyBill = await startChat(dialog);
  await expect(monthlyBill).toHaveValue(currencyPattern(1_000));
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("logo 3D gira por arraste do mouse e por teclado", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".hero-logo-model");
  await expect(page.locator('[data-model-loaded="true"]')).toBeVisible({
    timeout: 15_000,
  });
  await expect(canvas).toHaveAttribute("tabindex", "0");

  const initialRotation = Number(await canvas.getAttribute("data-rotation-y"));
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.78, box.y + box.height * 0.5, {
      steps: 5,
    });
    await page.mouse.up();
  }

  await expect
    .poll(async () => Number(await canvas.getAttribute("data-rotation-y")))
    .not.toBe(initialRotation);
  await expect(canvas).toHaveAttribute("data-manipulating", "false");

  await canvas.focus();
  const draggedRotation = Number(await canvas.getAttribute("data-rotation-y"));
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-rotation-y")))
    .not.toBe(draggedRotation);
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
    .getByRole("link", { name: "Localização" })
    .click();
  await expect(page).toHaveURL(/#faq/);
  const faq = page.getByRole("button", {
    name: "Vale a pena instalar energia solar?",
  });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "false");
  const { dialog } = await openFloatingChat(page);
  const monthlyBill = await startChat(dialog);
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe um valor de conta maior que zero."),
  ).toBeVisible();
  await expect(monthlyBill).toHaveAttribute("aria-invalid", "true");
});

test("indicadores contam ao entrar na viewport e o mapa permanece acessível", async ({
  page,
}) => {
  await page.goto("/");

  const metrics = page.getByRole("region", { name: "Resultados da Energy" });
  const values = metrics.locator(".solar-metric-value");
  await expect(values).toHaveText(["0+", "0k", "0%"]);

  const firstMetric = metrics.locator(".solar-metric").first();
  await metrics.scrollIntoViewIfNeeded();
  await expect(firstMetric).toHaveAttribute("data-counting", "true");
  await expect(firstMetric).toHaveAttribute("data-counting", "false", {
    timeout: 3_000,
  });
  await expect(values).toHaveText(["7+", "35k", "98%"], {
    timeout: 3_000,
  });

  const map = page.getByTitle(
    "Localização da Energy em Cidade Ocidental, Goiás",
  );
  await expect(map).toHaveAttribute("loading", "lazy");
  await expect(map).toHaveAttribute("src", /google\.com\/maps/);
});

test("as dez seções mantêm a ordem e a continuidade visual da página", async ({
  page,
}) => {
  await page.goto("/");

  const sections = page.locator("main.home-flow > section");
  await expect(sections).toHaveCount(10);
  const structure = await sections.evaluateAll((elements) =>
    elements.map((element, index) => {
      const rect = element.getBoundingClientRect();
      const previous =
        index > 0 ? elements[index - 1].getBoundingClientRect() : null;
      return {
        identity:
          element.id ||
          element.getAttribute("aria-label") ||
          element
            .querySelector('[aria-label="Comparação de abordagens"]')
            ?.getAttribute("aria-label"),
        height: rect.height,
        gapFromPrevious: previous ? rect.top - previous.bottom : 0,
      };
    }),
  );

  expect(structure.map(({ identity }) => identity)).toEqual([
    "inicio",
    "calculadora",
    "Resultados da Energy",
    "solucao",
    "solucoes",
    "beneficios",
    "quem-somos",
    "processo",
    "Comparação de abordagens",
    "faq",
  ]);
  expect(structure.every(({ height }) => height > 0)).toBe(true);
  expect(
    structure.slice(1).every(({ gapFromPrevious }) => gapFromPrevious >= -1),
  ).toBe(true);
  await expect(page.locator("[data-flow-transition]")).toHaveCount(0);
  await expect(page.locator("main.home-flow + footer.footer")).toHaveCount(1);
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await expect(page.locator("main.home-flow > section")).toHaveCount(10);
  await expectNoHorizontalOverflow(page);
});

test("calculadora é a segunda seção e está disponível na navegação", async ({
  page,
}) => {
  await page.goto("/");
  const sectionIds = await page
    .locator("main section")
    .evaluateAll((sections) =>
      sections.map((section) => section.id).filter(Boolean),
    );
  expect(sectionIds.slice(0, 3)).toEqual(["inicio", "calculadora", "solucao"]);

  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const calculatorLink = navigation.getByRole("link", { name: "Calculadora" });
  await expect(calculatorLink).toBeVisible();
  await calculatorLink.click();
  await expect(page).toHaveURL(/#calculadora$/);
  await expect(
    page.getByRole("heading", {
      name: "Quanto dinheiro sua conta de luz ainda vai consumir?",
    }),
  ).toBeVisible();
});

test("calcula e revela a projeção sem reajuste em moeda brasileira", async ({
  page,
}) => {
  await page.goto("/");
  const calculator = await configureCalculator(page, 1_000, 5);
  await expect(
    calculator.locator('[data-calculator-result="visible"]'),
  ).toHaveCount(0);

  const result = await revealCalculatorResult(page);
  await expect(result.getByRole("heading", { level: 3 })).toContainText(
    currencyPattern(60_000),
  );
  await expect(
    result
      .locator("dl > div")
      .filter({ hasText: "Gasto aproximado em 12 meses" })
      .locator("dd"),
  ).toHaveText(currencyPattern(12_000));
  await expect(
    result
      .locator("dl > div")
      .filter({ hasText: "Gasto no período escolhido" })
      .locator("dd"),
  ).toHaveText(currencyPattern(60_000));
  await expect(
    result
      .locator("dl > div")
      .filter({ hasText: "Média aproximada por dia" })
      .locator("dd"),
  ).toHaveText(currencyPattern(32.88));
  await expect(result).toContainText("Dinheiro pago à distribuidora");
  await expect(result).toContainText(
    "Possibilidade de investir na própria geração",
  );
});

test("aplica reajuste composto e trata taxa zero sem divisão inválida", async ({
  page,
}) => {
  await page.goto("/");
  const calculator = await configureCalculator(page, 1_000, 5);
  await calculator.getByRole("button", { name: "Opções avançadas" }).click();
  await calculator
    .getByRole("checkbox", { name: "Considerar reajuste anual" })
    .check();
  const rate = calculator.getByRole("spinbutton", {
    name: "Taxa de reajuste anual em porcentagem",
  });
  await rate.fill("10");

  const result = await revealCalculatorResult(page);
  const periodSpend = result
    .locator("dl > div")
    .filter({ hasText: "Gasto no período escolhido" })
    .locator("dd");
  await expect(periodSpend).toHaveText(currencyPattern(73_261.2));

  await rate.fill("0");
  await expect(periodSpend).toHaveText(currencyPattern(60_000));
  await expect(result).not.toContainText(/NaN|Infinity/);
});

test("slider monetário permanece sincronizado e permite trocar o período", async ({
  page,
}) => {
  await page.goto("/");
  const calculator = page.locator("#calculadora");
  const slider = calculator.getByRole("slider", {
    name: calculatorLabels.slider,
  });
  await slider.focus();
  for (let step = 0; step < 20; step += 1) {
    await slider.press("ArrowRight");
  }
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    currencyPattern(1_500),
  );
  await expect(calculator.getByLabel(calculatorLabels.monthlyBill)).toHaveValue(
    currencyPattern(1_500),
  );

  const horizon = calculator.getByRole("button", { name: "25 anos" });
  await horizon.click();
  await expect(horizon).toHaveAttribute("aria-pressed", "true");
  const result = await revealCalculatorResult(page);
  await expect(
    result
      .locator("dl > div")
      .filter({ hasText: "Gasto no período escolhido" })
      .locator("dd"),
  ).toHaveText(currencyPattern(450_000));
});

test("chat flutuante valida a conta, permite voltar e restaura o foco com Escape", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const { dialog, trigger } = await openFloatingChat(page);
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect
    .poll(() =>
      dialog.evaluate((element) => element.contains(document.activeElement)),
    )
    .toBe(true);

  const monthlyBill = await startChat(dialog);
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe um valor de conta maior que zero."),
  ).toBeVisible();
  await expect(monthlyBill).toHaveAttribute("aria-invalid", "true");

  await monthlyBill.fill("800");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByRole("button", { name: "Residência" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Voltar" }).click();
  await expect(dialog.getByLabel("Valor médio da conta de luz")).toHaveValue(
    currencyPattern(800),
  );

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("CTA do resultado abre o chat com valor e horizonte transferidos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await configureCalculator(page, 1_000, 5);
  const result = await revealCalculatorResult(page);
  await result
    .getByRole("button", { name: "Quero descobrir quanto posso economizar" })
    .click();

  const dialog = page.getByRole("dialog", { name: chatLabels.dialog });
  const monthlyBill = await startChat(dialog);
  await expect(
    dialog.getByText(/Já trouxe o valor usado na sua simulação/),
  ).toBeVisible();
  await expect(monthlyBill).toHaveValue(currencyPattern(1_000));
  await expect(
    dialog.getByRole("progressbar", { name: "Progresso da conversa" }),
  ).toHaveAttribute("aria-valuenow", /\d+/);
});

test("chat valida todas as etapas, corrige respostas e envia o payload esperado", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const payloads: Record<string, unknown>[] = [];
  let submissionAttempt = 0;
  await page.route("**/api/leads", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    payloads.push(route.request().postDataJSON() as Record<string, unknown>);
    submissionAttempt += 1;
    await route.fulfill({
      status: submissionAttempt === 1 ? 502 : 200,
      contentType: "application/json",
      body: JSON.stringify({
        message:
          submissionAttempt === 1
            ? "Falha simulada no canal de envio."
            : "Lead de teste recebido com sucesso.",
      }),
    });
  });

  await page.goto("/");
  const { dialog } = await openFloatingChat(page);
  const monthlyBill = await startChat(dialog);

  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe um valor de conta maior que zero."),
  ).toBeVisible();
  await monthlyBill.fill("1000");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  await dialog.getByRole("button", { name: "Empresa" }).click();
  const company = dialog.getByLabel("Nome da empresa");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(dialog.getByText("Informe o nome da empresa.")).toBeVisible();
  await expect(company).toHaveAttribute("aria-invalid", "true");
  await company.fill("Solar Teste Ltda");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const city = dialog.getByLabel("Cidade");
  const state = dialog.getByLabel("Estado");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe a cidade da instalação."),
  ).toBeVisible();
  await expect(
    dialog.getByText("Informe o estado da instalação."),
  ).toBeVisible();
  await city.fill("Campinas");
  await state.fill("SP");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const name = dialog.getByLabel("Nome", { exact: true });
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe como você gostaria de ser chamado."),
  ).toBeVisible();
  await name.fill("Ana Teste");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const whatsapp = dialog.getByLabel("WhatsApp");
  await whatsapp.fill("123");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(
    dialog.getByText("Informe um WhatsApp válido com DDD."),
  ).toBeVisible();
  await whatsapp.fill("(19) 99999-9999");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const email = dialog.getByLabel("E-mail");
  await email.fill("email-invalido");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(dialog.getByText("Informe um e-mail válido.")).toBeVisible();
  await email.fill("ana.teste@example.com");
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const summary = dialog.getByRole("heading", {
    name: "Resumo das suas informações",
  });
  await expect(summary).toBeVisible();
  await expect(dialog).toContainText(currencyPattern(120_000));
  await dialog.getByRole("button", { name: "Corrigir resposta" }).click();
  await expect(dialog.getByLabel("Valor médio da conta de luz")).toHaveValue(
    currencyPattern(1_000),
  );

  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Empresa" }).click();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await expect(summary).toBeVisible();
  await dialog.getByRole("button", { name: "Continuar" }).click();

  const consent = dialog.getByRole("checkbox", { name: /Autorizo/ });
  const privacyLink = dialog.getByRole("link", {
    name: "Política de Privacidade",
  });
  await expect(privacyLink).toHaveAttribute("href", "/privacidade");
  await dialog
    .getByRole("button", { name: "Enviar para um especialista" })
    .click();
  await expect(
    dialog.getByText(
      "Você precisa autorizar o envio e o tratamento dos dados.",
    ),
  ).toBeVisible();
  await consent.check();

  const storageValues = await page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.getItem(localStorage.key(index) ?? ""),
    ).join(" "),
  );
  expect(storageValues).not.toContain("Ana Teste");
  expect(storageValues).not.toContain("ana.teste@example.com");
  expect(storageValues).not.toContain("99999-9999");

  const submit = dialog.getByRole("button", {
    name: "Enviar para um especialista",
  });
  await submit.click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "Falha simulada no canal de envio.",
  );
  await expect(dialog.getByText(/Recebemos seus dados/)).toHaveCount(0);

  await submit.click();
  await expect(
    dialog.getByText("Lead de teste recebido com sucesso."),
  ).toBeVisible();
  await expect.poll(() => payloads.length).toBe(2);
  expect(payloads[0]).toEqual(
    expect.objectContaining({
      name: "Ana Teste",
      company: "Solar Teste Ltda",
      email: "ana.teste@example.com",
      phone: "(19) 99999-9999",
      customerType: "business",
      monthlyBill: 1_000,
      city: "Campinas",
      state: "SP",
      analysisHorizon: 10,
      estimatedSpendWithoutSolar: 120_000,
      consent: true,
      origin: "conversational-chat",
      website: "",
      message: expect.any(String),
    }),
  );
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
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Localização" })
    .focus();
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

test("menu mobile permanece utilizável com movimento reduzido", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Abrir menu" });
  await menu.click();
  await expect(
    page
      .getByRole("navigation", { name: "Menu mobile" })
      .getByRole("link", { name: "Localização" }),
  ).toBeVisible();
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
  await expect(page.locator('[data-model-loaded="true"]')).toBeVisible({
    timeout: 15_000,
  });

  const reveal = page.locator("[data-motion-reveal]").first();
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveCSS("opacity", "1");

  const symbol = page.locator(".hero-logo-model-motion");
  await expect(symbol).toBeVisible();
  await expect(page.locator(".hero-logo-model")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await expect(page.locator(".hero-logo-model-shell")).toHaveAttribute(
    "data-interactive",
    "false",
  );
  await expect(page.locator(".hero")).toHaveAttribute(
    "data-cursor-motion",
    "disabled",
  );
  await expect(page.locator(".magnetic-button").first()).toHaveAttribute(
    "data-magnetic-enabled",
    "false",
  );
  const before = await symbol.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(100);
  const after = await symbol.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  expect(after).toBe(before);

  const faq = page.getByRole("button", {
    name: "Vocês atendem minha cidade?",
  });
  await faq.click();
  await expect(faq).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("region", { name: "Vocês atendem minha cidade?" }),
  ).toBeVisible();

  await configureCalculator(page, 1_000, 5);
  const calculatorResult = await revealCalculatorResult(page);
  await expect(calculatorResult).toHaveCSS("opacity", "1");
  await calculatorResult
    .getByRole("button", { name: "Quero descobrir quanto posso economizar" })
    .click();
  const dialog = page.getByRole("dialog", { name: chatLabels.dialog });
  await expect(dialog).toHaveAttribute("data-motion", "reduced");
  await startChat(dialog);
  await page.keyboard.press("Escape");
});

test("carrossel responde a teclado, controles e arraste", async ({ page }) => {
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Por dentro da Energy" });
  await carousel.scrollIntoViewIfNeeded();
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    carousel.getByRole("button", {
      name: /Conhecimento técnico: Tecnologia explicada com clareza., conteúdo atual/i,
    }),
  ).toHaveAttribute("aria-current", "true");

  await carousel.getByRole("button", { name: "História anterior" }).click();
  await expect(
    carousel.getByRole("button", {
      name: /Planejamento: Cada projeto começa com contexto., conteúdo atual/i,
    }),
  ).toHaveAttribute("aria-current", "true");

  const slide = carousel.locator(".company-carousel-stage");
  await slide.scrollIntoViewIfNeeded();
  const box = await slide.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.72, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, {
      steps: 6,
    });
    await page.mouse.up();
  }
  await expect(
    carousel.getByRole("button", {
      name: /Conhecimento técnico: Tecnologia explicada com clareza., conteúdo atual/i,
    }),
  ).toHaveAttribute("aria-current", "true");
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
      name: "Localização",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("O sistema se paga em poucos anos"),
  ).toBeVisible();

  await expect(page.locator("main.home-flow > section")).toHaveCount(10);
  await expect(page.locator("[data-flow-transition]")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

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

test("API aceita o payload conversacional, preserva o honeypot e não simula sucesso sem canal", async ({
  request,
}) => {
  const conversationalPayload = {
    name: "Ana Teste",
    company: "Solar Teste Ltda",
    email: "ana.teste@example.com",
    phone: "(19) 99999-9999",
    message: "Simulação automatizada para validação do fluxo conversacional.",
    consent: true,
    website: "",
    origin: "conversational-chat",
    customerType: "business",
    monthlyBill: 1_000,
    city: "Campinas",
    state: "SP",
    analysisHorizon: 5,
    estimatedSpendWithoutSolar: 60_000,
  };

  const withoutChannel = await request.post("/api/leads", {
    data: conversationalPayload,
  });
  expect(withoutChannel.status()).toBe(503);
  await expect(withoutChannel.json()).resolves.toMatchObject({
    message: expect.stringContaining(
      "canal de envio ainda não está configurado",
    ),
  });

  const honeypot = await request.post("/api/leads", {
    data: { ...conversationalPayload, website: "https://spam.example" },
  });
  expect(honeypot.status()).toBe(200);
  await expect(honeypot.json()).resolves.toEqual({
    message: "Solicitação recebida.",
  });
});

test("BLOG aparece após Localização e abre a página pública", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const links = await navigation.getByRole("link").allTextContents();
  expect(links.indexOf("BLOG")).toBe(links.indexOf("Localização") + 1);
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
  await expect(page.getByLabel("Usuário")).toBeVisible();
  const adminApi = await page.request.get("/api/admin/posts");
  expect(adminApi.status()).toBe(401);
});

test("blog mantém a busca antes do feed no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/blog");
  const search = await page.locator(".news-main-search").boundingBox();
  const firstCard = await page.locator(".news-card").first().boundingBox();
  expect(search).not.toBeNull();
  expect(firstCard).not.toBeNull();
  expect(search!.y).toBeLessThan(firstCard!.y);
  await expectNoHorizontalOverflow(page);
});

test("login administrativo cabe em telas estreitas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/admin/login");
  await expectNoHorizontalOverflow(page);
});

test("menu de tablet substitui a navegação desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/");
  await expect(page.locator(".desktop-nav")).toBeHidden();
  const trigger = page.getByRole("button", { name: "Abrir menu" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = page.getByRole("navigation", { name: "Menu mobile" });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("overflow-y", "auto");
});

for (const width of [280, 320, 360, 390, 768, 900, 1024, 1440]) {
  test(`não apresenta overflow horizontal em ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expectNoHorizontalOverflow(page);

    await configureCalculator(page, 1_000, 25);
    const result = await revealCalculatorResult(page);
    await expectNoHorizontalOverflow(page);
    await result
      .getByRole("button", { name: "Quero descobrir quanto posso economizar" })
      .click();
    await expect(
      page.getByRole("dialog", { name: chatLabels.dialog }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}
