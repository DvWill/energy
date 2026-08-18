import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const dark = "rgb(23, 26, 31)";
const secondary = "rgb(71, 84, 103)";

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => sessionStorage.setItem("energy-entry-calculator-seen-v2", "true"));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const section = page.locator("#equipamentos");
  await section.scrollIntoViewIfNeeded();
  if (await section.locator(".equipment-detail-panel").count()) throw new Error(`${name}: detail open initially`);
  if (await section.locator(".equipment-card").count() !== 4) throw new Error(`${name}: expected four cards`);
  if (await section.locator(".equipment-carousel, .equipment-arrow").count()) throw new Error(`${name}: legacy carousel found`);
  const hintFill = await section.locator(".equipment-discovery-hint > span").evaluate((element) => getComputedStyle(element).webkitTextFillColor);
  if (hintFill !== "rgb(55, 65, 81)") throw new Error(`${name}: unreadable discovery hint ${hintFill}`);
  await section.screenshot({ path: `artifacts/equipment-${name}-initial.png`, animations: "disabled" });

  const firstCard = section.getByRole("button", { name: "Conheça o equipamento Painéis solares" });
  await firstCard.click();
  await section.getByRole("button", { name: "Fechar detalhes do equipamento" }).click();
  await section.locator(".equipment-detail-panel").waitFor({ state: "detached" });
  if (await section.locator('.equipment-card[aria-pressed="true"]').count()) throw new Error(`${name}: close button kept selection`);

  await firstCard.click();
  await firstCard.click();
  await section.locator(".equipment-detail-panel").waitFor({ state: "detached" });
  if (await section.locator('.equipment-card[aria-pressed="true"]').count()) throw new Error(`${name}: second click kept selection`);

  await firstCard.click();
  await page.keyboard.press("Escape");
  await section.locator(".equipment-detail-panel").waitFor({ state: "detached" });
  if (await section.locator('.equipment-card[aria-pressed="true"]').count()) throw new Error(`${name}: Escape kept selection`);

  for (const product of ["Painéis solares", "Inversor solar", "Microinversores", "Estrutura de fixação"]) {
    await section.getByRole("button", { name: `Conheça o equipamento ${product}` }).first().click();
    const title = section.locator(".equipment-detail-copy h3");
    await title.waitFor();
    if (await section.locator(".equipment-card").count() !== 4) throw new Error(`${name}/${product}: selected card disappeared`);
    if (await section.locator('.equipment-card[aria-pressed="true"]').count() !== 1) throw new Error(`${name}/${product}: invalid selected state`);
    const titleFill = await title.evaluate((element) => getComputedStyle(element).webkitTextFillColor);
    const summaryFill = await section.locator(".equipment-detail-copy > p").first().evaluate((element) => getComputedStyle(element).webkitTextFillColor);
    if (titleFill !== dark || summaryFill !== secondary) {
      throw new Error(`${name}/${product}: unreadable colors ${titleFill}, ${summaryFill}`);
    }
  }

  await section.getByRole("button", { name: "Conheça o equipamento Painéis solares" }).click();
  await section.screenshot({ path: `artifacts/equipment-${name}-selected.png`, animations: "disabled" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflow) throw new Error(`${name}: horizontal overflow`);
  await page.close();
}

await browser.close();
