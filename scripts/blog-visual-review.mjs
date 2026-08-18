import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });

for (const [name, width, height] of [["desktop", 1440, 1000], ["tablet", 900, 1000], ["mobile", 390, 844]]) {
  const context = await browser.newContext({ viewport: { width, height }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/blog", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 0));
  if ((await page.locator('.desktop-nav a[aria-current="page"]').textContent()) !== "BLOG") throw new Error(`${name}: Blog não está ativo`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`${name}: overflow horizontal de ${overflow}px`);
  if (await page.locator('text=/curtir|comentários|newsletter/i').count()) throw new Error(`${name}: conteúdo proibido encontrado`);
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `artifacts/blog-${name}.png`, fullPage: true, animations: "disabled" });
  if (name === "desktop") {
    const initialCards = await page.locator(".news-card").count();
    await page.locator('.news-search input').fill("bandeira");
    if (await page.locator(".news-card").count() !== 1) throw new Error("busca não filtrou o feed");
    await page.getByRole("button", { name: "Limpar busca" }).click();
    await page.getByRole("button", { name: "Economia", exact: true }).click();
    if (await page.locator(".news-card").count() !== 1) throw new Error("categoria não filtrou o feed");
    await page.getByRole("button", { name: "Todos", exact: true }).click();
    const save = page.locator('.news-card').first().getByRole("button", { name: "Salvar notícia" });
    await save.click();
    if (!(await page.evaluate(() => JSON.parse(localStorage.getItem("energy-saved-news") ?? "[]").length))) throw new Error("salvamento não persistiu");
    await page.locator('.news-card').first().getByRole("button", { name: /Compartilhar/ }).click();
    if (await page.locator(".news-load-more").count()) {
      await page.locator(".news-load-more").click();
      await page.waitForTimeout(350);
      if (await page.locator(".news-card").count() <= initialCards) throw new Error("carregar mais não adicionou cards");
    }
  }
  if (errors.length) throw new Error(`${name}: erros no console: ${errors.join(" | ")}`);
  await context.close();
}

await browser.close();
