import { expect, test, type Locator } from "@playwright/test";

const storageKey = "energy-entry-calculator-seen";
const dialogName = "Calculadora inicial Energy";

async function waitForDialog(page: import("@playwright/test").Page) {
  const dialog = page.getByRole("dialog", { name: dialogName });
  await expect(dialog).toBeVisible({ timeout: 3_000 });
  return dialog;
}

async function scrollIntoDialogView(locator: Locator) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ block: "center", inline: "nearest" }),
  );
}

test("mostra somente a logo sobre o fundo desfocado por um segundo", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const splash = page.locator('[data-entry-stage="splash"]');
  await expect(splash).toBeVisible();
  await expect(splash).toHaveAttribute("data-splash-started-at", /\d/);
  const startedAt = Number(await splash.getAttribute("data-splash-started-at"));
  const splashStyle = await splash.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backdropFilter: style.backdropFilter,
      childCount: element.children.length,
    };
  });
  expect(splashStyle.backgroundColor).toBe("rgba(3, 15, 27, 0.56)");
  const siteFilter = await page
    .locator("[data-entry-site-content]")
    .evaluate((element) => getComputedStyle(element).filter);
  expect(
    splashStyle.backdropFilter.includes("blur(") || siteFilter.includes("blur("),
  ).toBe(true);
  expect(splashStyle.childCount).toBe(1);

  const logo = splash.locator(":scope > img");
  await expect(logo).toBeVisible();
  const [viewport, logoBox] = await Promise.all([
    page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
    logo.boundingBox(),
  ]);
  expect(logoBox).not.toBeNull();
  expect(
    Math.abs(logoBox!.x + logoBox!.width / 2 - viewport.width / 2),
  ).toBeLessThan(2);
  expect(
    Math.abs(logoBox!.y + logoBox!.height / 2 - viewport.height / 2),
  ).toBeLessThan(2);

  await waitForDialog(page);
  const elapsed = await page.evaluate(
    (start) => performance.now() - start,
    startedAt,
  );
  expect(elapsed).toBeGreaterThanOrEqual(900);
  await expect(splash).toBeHidden();
  expect(runtimeErrors).toEqual([]);
});

test("usa a mesma animação de entrada do resultado da calculadora principal", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = await waitForDialog(page);
  const calculate = dialog.getByRole("button", {
    name: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE",
  });

  await dialog.evaluate((element) => {
    const captureWindow = window as typeof window & {
      __entryResultAnimations?: Array<{ duration: number; easing: string }>;
    };
    captureWindow.__entryResultAnimations = [];
    const observer = new MutationObserver(() => {
      let attempts = 0;
      const capture = () => {
        const result = element.querySelector<HTMLElement>(
          '[data-calculator-result="visible"]',
        );
        const animations = result?.getAnimations() ?? [];
        if (animations.length) {
          captureWindow.__entryResultAnimations = animations.map(
            (animation) => {
              const timing = animation.effect?.getTiming();
              return {
                duration: Number(timing?.duration ?? 0),
                easing: timing?.easing ?? "",
              };
            },
          );
          observer.disconnect();
          return;
        }
        attempts += 1;
        if (attempts < 12) requestAnimationFrame(capture);
      };
      requestAnimationFrame(capture);
    });
    observer.observe(element, { childList: true, subtree: true });
  });

  await scrollIntoDialogView(calculate);
  await calculate.click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as typeof window & {
              __entryResultAnimations?: Array<{
                duration: number;
                easing: string;
              }>;
            }
          ).__entryResultAnimations ?? [],
      ),
    )
    .toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          duration: 680,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        }),
      ]),
    );
});

test("repete o design completo da calculadora e libera o site após o resultado", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = await waitForDialog(page);

  await expect(dialog.getByText("SIMULAÇÃO INTERATIVA")).toBeVisible();
  await expect(
    dialog.getByText("Construa sua projeção em poucos segundos"),
  ).toBeVisible();
  for (const step of ["Conta mensal", "Período", "Resultado"]) {
    await expect(dialog.getByText(step, { exact: true })).toBeVisible();
  }
  for (const period of ["1 ano", "5 anos", "10 anos", "25 anos"]) {
    await expect(
      dialog.getByRole("button", { name: period, exact: true }),
    ).toBeVisible();
  }
  await expect(
    dialog.getByRole("button", { name: /Opções avançadas/ }),
  ).toBeVisible();

  const bill = dialog.getByLabel("Qual é o valor médio da sua conta de luz?");
  await expect(bill).toBeFocused();
  await expect(page.locator("[data-entry-site-content]")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator("[data-entry-site-content]")
        .evaluate((element) => (element as HTMLElement).inert),
    )
    .toBe(true);

  await bill.fill("500");
  await dialog.getByRole("button", { name: "5 anos", exact: true }).click();
  await dialog.getByRole("button", { name: /Opções avançadas/ }).click();
  await dialog.getByRole("checkbox", { name: "Considerar reajuste anual" }).check();
  await dialog
    .getByRole("spinbutton", { name: "Taxa de reajuste anual no pop-up" })
    .fill("10");
  const calculate = dialog.getByRole("button", {
    name: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE",
  });
  await scrollIntoDialogView(calculate);
  await calculate.click();

  const result = dialog.locator('[data-calculator-result="visible"]');
  await expect(result).toBeFocused();
  await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBe(0);
  const resultAmount = dialog.getByRole("heading", {
    name: /R\$\s*36\.630,60 em 5 anos/,
  });
  await expect(
    resultAmount,
  ).toBeVisible();
  await expect(dialog.getByText(/Olha o tanto de dinheiro/)).toBeVisible();

  await dialog.getByRole("button", { name: "Ajustar simulação" }).click();
  await expect(bill).toBeFocused();
  await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBe(0);
  await scrollIntoDialogView(calculate);
  await calculate.click();
  const enterSite = dialog.getByRole("button", {
    name: "ENTRAR NO SITE E CONHECER A SOLUÇÃO",
  });
  await scrollIntoDialogView(enterSite);
  await enterSite.click();

  await expect(dialog).toBeHidden();
  const siteCalculator = page.locator("#calculadora");
  await expect(siteCalculator).toHaveAttribute("data-calculator-state", "result");
  await expect(
    siteCalculator.getByRole("heading", {
      name: /R\$\s*36\.630,60 em 5 anos/,
    }),
  ).toBeVisible();
  await expect(
    siteCalculator.getByRole("spinbutton", {
      name: "Taxa de reajuste anual em porcentagem",
    }),
  ).toHaveValue("10");
  await expect(page.locator("[data-entry-site-content]")).not.toHaveAttribute(
    "aria-hidden",
    "true",
  );
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .toBe("");

  await siteCalculator.getByRole("button", { name: "Ajustar simulação" }).click();
  await expect(
    siteCalculator.getByLabel("Valor médio mensal da conta de energia em reais"),
  ).toHaveValue(/R\$\s*500,00/);
  await expect(
    siteCalculator.getByRole("button", { name: "5 anos", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    siteCalculator.getByRole("checkbox", { name: "Considerar reajuste anual" }),
  ).toBeChecked();

  await page.reload();
  await page.waitForTimeout(1_100);
  await expect(page.locator("[data-entry-stage]")).toHaveCount(0);
  await expect(page.locator("#calculadora")).toHaveAttribute(
    "data-calculator-state",
    "result",
  );
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key), storageKey))
    .toBe("true");
});

test("mantém IDs isolados, fecha por teclado e cabe no celular", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const dialog = await waitForDialog(page);
  await dialog.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );

  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320.5);
  expect(box!.y + box!.height).toBeLessThanOrEqual(568.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );

  const ids = await page.locator("[id]").evaluateAll((elements) =>
    elements.map((element) => element.id),
  );
  expect(new Set(ids).size).toBe(ids.length);
  const inputId = await dialog
    .getByLabel("Qual é o valor médio da sua conta de luz?")
    .getAttribute("id");
  expect(inputId).toBe("entry-calculator-monthly-bill");

  const bill = dialog.getByLabel("Qual é o valor médio da sua conta de luz?");
  await bill.fill("500");
  const calculate = dialog.getByRole("button", {
    name: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE",
  });
  await scrollIntoDialogView(calculate);
  await calculate.click();
  const resultAmount = dialog.getByRole("heading", {
    name: /R\$\s*60\.000,00 em 10 anos/,
  });
  const amountBox = await resultAmount.boundingBox();
  expect(amountBox).not.toBeNull();
  expect(amountBox!.y).toBeGreaterThanOrEqual(0);
  expect(amountBox!.y + amountBox!.height).toBeLessThanOrEqual(568);

  const closeButton = dialog.getByRole("button", {
    name: "Entrar no site sem calcular",
  });
  await expect(closeButton).toBeVisible();
  await dialog.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(closeButton).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.reload();
  await page.waitForTimeout(1_100);
  await expect(page.getByRole("dialog", { name: dialogName })).toHaveCount(0);
});

test("não interfere no blog nem no painel administrativo", async ({ page }) => {
  await page.goto("/blog");
  await page.waitForTimeout(1_100);
  await expect(page.locator("[data-entry-stage]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/admin/login");
  await expect(page.locator("[data-entry-stage]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Acesso administrativo" }),
  ).toBeVisible();
});
