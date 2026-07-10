import { expect, test } from "@playwright/test";

test("jornada essencial da landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Energia inteligente");
  await expect(page.getByRole("link", { name: "Solicitar uma proposta" }).first()).toBeVisible();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/#faq/);
  const faq = page.getByRole("button", { name: "O que a Energy oferece?" });
  await faq.click(); await expect(faq).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
});

test("menu mobile abre e fecha após navegação", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  const menu = page.locator(".menu-button"); await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Quem somos" }).click();
  await expect(page).toHaveURL(/#quem-somos/); await expect(page.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
});
