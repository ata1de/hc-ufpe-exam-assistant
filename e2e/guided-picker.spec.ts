import { test, expect } from "@playwright/test"
import { waitForReply } from "./helpers"

/**
 * Fluxo guiado do paciente: modalidade → exame base → eixos (contraste/sedação/lado).
 * Ao final, envia a query e o assistente responde.
 */
test("picker guiado navega até uma resposta", async ({ page }) => {
  await page.goto("/chat?profile=patient")

  // Passo 1 — o picker aparece com a pergunta de modalidade.
  await expect(
    page.getByRole("heading", { name: "Que tipo de exame você vai fazer?" }),
  ).toBeVisible()

  // Escolhe Ressonância (modalidade com sub-exames → abre passo 2).
  await page.getByRole("button", { name: /ressonância/i }).first().click()

  // Passo 2 — lista de exames base. Escolhe o primeiro da lista.
  await expect(page.getByLabel("Buscar exame")).toBeVisible()
  const firstBase = page
    .locator("div.overflow-y-auto button")
    .first()
  await firstBase.click()

  // Passo 3 (se houver eixos) — responde à primeira pergunta que aparecer.
  // Alguns exames vão direto à resposta; então tratamos os dois casos.
  const contraste = page.getByRole("button", { name: /com contraste|sem contraste/i })
  if (await contraste.count()) {
    await contraste.first().click()
  }
  // Continua respondendo eixos até sair do picker (sedação/lado, se existirem).
  for (const rx of [/com sedação|sem sedação/i, /direito|esquerdo/i]) {
    const btn = page.getByRole("button", { name: rx })
    if (await btn.count()) await btn.first().click()
  }

  // Deve ter enviado a pergunta e recebido uma resposta.
  const reply = await waitForReply(page, 0)
  expect(reply.length).toBeGreaterThan(20)
})
