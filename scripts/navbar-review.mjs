import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });

async function preparePage(width, height, hash = "") {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() =>
    sessionStorage.setItem("energy-entry-calculator-seen-v2", "true"),
  );
  await page.goto(`http://localhost:3000/${hash}`, { waitUntil: "networkidle" });
  return page;
}

const desktop = await preparePage(1440, 900);
const desktopNav = desktop.locator(".desktop-nav");
await desktopNav.getByRole("link", { name: "Equipamentos", exact: true }).click();
await desktop.waitForFunction(() => location.hash === "#equipamentos");
await desktop.waitForTimeout(1800);
const desktopActive = await desktopNav.locator('a[aria-current="location"]').allTextContents();
if (desktopActive.join("") !== "Equipamentos") {
  throw new Error(`desktop: Equipamentos não ficou como único item ativo (${desktopActive.join(", ") || "nenhum"})`);
}
const sectionTop = await desktop.locator("#equipamentos").evaluate((node) => node.getBoundingClientRect().top);
if (sectionTop < 85) throw new Error(`desktop: título encoberto pela navbar (${sectionTop}px)`);
await desktop.locator("#equipamentos .equipment-card").first().click();
await desktop.waitForTimeout(250);
if ((await desktopNav.locator('a[aria-current="location"]').textContent()) !== "Equipamentos") {
  throw new Error("desktop: abrir detalhes alterou o item ativo");
}
await desktop.locator("#solucoes").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(400);
if ((await desktopNav.locator('a[aria-current="location"]').textContent()) !== "Soluções") {
  throw new Error("desktop: Soluções não assumiu o estado ativo");
}
await desktop.close();

const direct = await preparePage(1440, 900, "#equipamentos");
await direct.waitForTimeout(500);
if ((await direct.locator('.desktop-nav a[aria-current="location"]').textContent()) !== "Equipamentos") {
  throw new Error("desktop: acesso direto por hash não ativou Equipamentos");
}
await direct.close();

const mobile = await preparePage(390, 844);
await mobile.getByRole("button", { name: "Abrir menu" }).click();
const mobileNav = mobile.locator("#main-nav");
await mobileNav.getByRole("link", { name: "Equipamentos", exact: true }).click();
await mobile.waitForTimeout(1800);
if ((await mobile.getByRole("button", { name: "Abrir menu" }).getAttribute("aria-expanded")) !== "false") {
  throw new Error("mobile: menu não fechou depois do clique");
}
await mobile.getByRole("button", { name: "Abrir menu" }).click();
if ((await mobileNav.locator('a[aria-current="location"]').textContent()) !== "Equipamentos") {
  throw new Error("mobile: Equipamentos não ficou ativo");
}
await mobile.close();

await browser.close();
