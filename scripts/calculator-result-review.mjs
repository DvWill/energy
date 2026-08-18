import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });

async function pageFor(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => sessionStorage.setItem("energy-entry-calculator-seen-v2", "true"));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  return page;
}

async function simulate(page, monthly, years) {
  const calculator = page.locator("#calculadora");
  await calculator.scrollIntoViewIfNeeded();
  const input = calculator.getByLabel("Valor médio mensal da conta de energia em reais");
  await input.fill(String(monthly));
  await input.blur();
  await calculator.getByRole("button", { name: `${years} ${years === 1 ? "ano" : "anos"}`, exact: true }).click();
  await calculator.getByRole("button", { name: "CLIQUE AQUI E VEJA O QUANTO VOCÊ PERDE" }).click();
  const result = calculator.locator('[data-calculator-result="visible"]');
  await result.waitFor({ state: "visible" });
  return { calculator, result, input };
}

const desktop = await pageFor(1440, 1000);
let state = await simulate(desktop, 300, 5);
for (const expected of ["R$ 21.978,36", "1 viagem", "2 smartphones premium", "R$ 21 mil", "para começar a entrada de um imóvel"]) {
  if (!(await state.result.getByText(expected, { exact: false }).count())) throw new Error(`300/5: ausente ${expected}`);
}
await state.result.screenshot({ path: "artifacts/calculator-result-desktop.png", animations: "disabled" });
await state.result.getByRole("button", { name: "Ajustar simulação" }).click();
if (!(await state.input.inputValue()).includes("300,00")) throw new Error("Ajustar simulação perdeu o valor");
state = await simulate(desktop, 500, 10);
for (const expected of ["R$ 95.624,55", "8 viagens", "11 smartphones premium", "R$ 95 mil"]) {
  if (!(await state.result.getByText(expected, { exact: false }).count())) throw new Error(`500/10: ausente ${expected}`);
}
await state.result.getByRole("button", { name: "QUERO PARAR DE PERDER DINHEIRO" }).click();
if (!(await desktop.getByRole("dialog", { name: "Conversa para simulação de energia solar" }).isVisible())) throw new Error("CTA não abriu o chat");
await desktop.close();

const mobile = await pageFor(390, 844);
state = await simulate(mobile, 100, 1);
if (await state.result.getByText(/(^|\s)0 (viagem|viagens|smartphone|smartphones)/i).count()) throw new Error("100/1: comparação exibiu zero");
if (!(await state.result.getByText(/% do valor/).count())) throw new Error("100/1: smartphone proporcional ausente");
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 1) throw new Error(`mobile: overflow horizontal de ${overflow}px`);
await state.result.screenshot({ path: "artifacts/calculator-result-mobile.png", animations: "disabled" });
await mobile.close();

await browser.close();
