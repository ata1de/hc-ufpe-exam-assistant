import type { ReactNode } from "react"

// Trava a viewport na rota /chat: o layout do chat já usa h-svh + overflow-hidden
// no container, mas sem prender o html/body qualquer overflow transitório
// (ex.: o scroll suave disparado ao aparecer o indicador de "digitando") vaza
// para uma 2ª scrollbar da página inteira. `overflow-hidden` no wrapper de rota
// garante que o único scroll seja o do painel de mensagens.
export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="h-svh overflow-hidden">{children}</div>
}
