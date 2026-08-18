import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "notebook-1440", width: 1440, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`tema laranja responsivo em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      sessionStorage.setItem("energy-entry-calculator-seen-v2", "true");
    });
    await page.goto("/");

    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(249, 95, 27)",
    );
    await expect(page.locator(".hero-background")).toBeVisible();

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      containerWidth: document.querySelector<HTMLElement>(
        ".savings-calculator-section .container",
      )?.getBoundingClientRect().width ?? 0,
      heroOpacity: getComputedStyle(
        document.querySelector<HTMLElement>(".hero-background")!,
      ).opacity,
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    expect(Number(layout.heroOpacity)).toBeGreaterThan(0.9);
    if (viewport.width >= 1440) expect(layout.containerWidth).toBeGreaterThan(1000);

  });
}
