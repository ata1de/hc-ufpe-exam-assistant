import { expect, type Page } from "@playwright/test"

/** Abre o chat no perfil desejado, começando uma conversa nova e limpa. */
export async function openChat(page: Page, profile: "patient" | "professional") {
  await page.goto(`/chat?profile=${profile}`)
  await expect(page.getByRole("textbox", { name: "Mensagem" })).toBeVisible()
}

/** Digita e envia uma pergunta pela caixa de mensagem. */
export async function ask(page: Page, text: string) {
  const box = page.getByRole("textbox", { name: "Mensagem" })
  await box.fill(text)
  await page.getByLabel("Enviar mensagem").click()
}

/** Localizador das bolhas do assistente (à esquerda). */
export function assistantBubbles(page: Page) {
  return page.locator(".justify-start .bg-card")
}

/**
 * Espera a próxima resposta do assistente aparecer, contando as bolhas antes.
 * Retorna o texto da última bolha do assistente.
 */
export async function waitForReply(page: Page, prevCount: number): Promise<string> {
  const bubbles = assistantBubbles(page)
  await expect(async () => {
    expect(await bubbles.count()).toBeGreaterThan(prevCount)
  }).toPass()
  // Indicador "digitando" some quando a resposta chega.
  await expect(page.getByText("Assistente digitando")).toHaveCount(0)
  const last = bubbles.last()
  await expect(last).not.toBeEmpty()
  return (await last.innerText()).trim()
}
