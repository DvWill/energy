import { chromium } from "@playwright/test";

const expected = "rgb(249, 95, 27)";
const browser = await chromium.launch({ headless: true });

for (const [name, width, height] of [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => {
    sessionStorage.setItem("energy-entry-calculator-seen-v2", "true");
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir conversa para fazer uma simulação" }).click();
  const dialog = page.getByRole("dialog", { name: "Conversa para simulação de energia solar" });
  await dialog.waitFor();
  const theme = await page.locator("html").getAttribute("data-theme");

  const targets = [
    ["title", dialog.locator("h2")],
    ["subtitle", dialog.locator(".chat-dialog-header p")],
    ["progress", dialog.locator(".chat-progress-copy span").first()],
    ["message", dialog.locator(".chat-message-bubble p").first()],
    ["continue", dialog.getByRole("button", { name: "Continuar" })],
  ];
  for (const [label, target] of targets) {
    const styles = await target.evaluate((element) => ({
      color: getComputedStyle(element).color,
      fill: getComputedStyle(element).webkitTextFillColor,
      opacity: getComputedStyle(element).opacity,
      visibility: getComputedStyle(element).visibility,
    }));
    if (styles.fill !== expected || styles.opacity === "0" || styles.visibility !== "visible") {
      throw new Error(`${name}/${label} theme=${theme}: unreadable chat text ${JSON.stringify(styles)}`);
    }
  }

  await dialog.screenshot({ path: `artifacts/chat-${name}-initial.png` });
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByLabel("Valor médio da conta de luz").waitFor();
  await dialog.screenshot({ path: `artifacts/chat-${name}-next-step.png` });
  await page.close();
}

await browser.close();
