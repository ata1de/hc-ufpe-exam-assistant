import { defineConfig, devices } from "@playwright/test"

/**
 * E2E do Assistente UDI HC-UFPE.
 * Sobe o `next dev` automaticamente e testa o fluxo real no browser,
 * batendo na IA real (CLAUDE_API_KEY em .env.local) via /api/chat.
 */
export default defineConfig({
  testDir: "./e2e",
  // Respostas da IA levam alguns segundos; damos folga por teste.
  timeout: 90_000,
  expect: { timeout: 30_000 },
  // Sem paralelismo: chamadas simultâneas à IA encarecem e podem esbarrar em rate limit.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
