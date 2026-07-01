"use client"

import { useEffect, type ReactNode } from "react"

// Trava a viewport na rota /chat. O container do chat já usa h-svh +
// overflow-hidden, mas em alguns navegadores um overflow transitório (ex.: o
// scroll suave disparado ao aparecer o indicador de "digitando") vaza para uma
// 2ª scrollbar da página inteira. Aqui prendemos html/body com overflow:hidden
// enquanto a rota /chat estiver montada — e restauramos ao sair (a home usa
// min-h-svh e precisa poder crescer). O único scroll passa a ser o do painel
// de mensagens.
export default function ChatLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [])

  return <div className="h-svh overflow-hidden">{children}</div>
}
