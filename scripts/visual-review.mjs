import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["notebook", 1280, 900],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
]) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    sessionStorage.setItem("energy-entry-calculator-seen-v2", "true");
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  if (overflow) throw new Error(`Horizontal overflow detected at ${width}px`);
  await page.screenshot({
    path: `artifacts/energy-${name}.png`,
    fullPage: true,
    animations: "allow",
  });
  const criteria = page.locator(".criteria-section");
  await criteria.scrollIntoViewIfNeeded();
  await criteria.screenshot({
    path: `artifacts/criteria-${name}.png`,
    animations: "disabled",
  });
  await context.close();
}
await browser.close();
