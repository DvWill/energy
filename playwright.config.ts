import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3107";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // The landing keeps a WebGL canvas alive while calculator/chat interactions
  // run. A single worker prevents GPU stalls from making keyboard tests flaky.
  workers: 1,
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // E2E data must never reach a developer's or CI environment's real CRM.
      LEAD_WEBHOOK_URL: "",
      NEXT_PUBLIC_LEAD_FORM_URL: "/api/leads",
      NEXT_PUBLIC_STATIC_HOST: "false",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
