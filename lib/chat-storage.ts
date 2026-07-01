import type { ChatSession } from "./types"

const STORAGE_KEY = "hc-ufpe-chat-sessions"
const DAY_MS = 24 * 60 * 60 * 1000

/** Conversas expiram 7 dias após a última atividade. */
export const TTL_MS = 7 * DAY_MS
/** Limite de conversas guardadas — evita sobrecarregar o localStorage. */
export const MAX_SESSIONS = 30

function isExpired(session: ChatSession, ref: number): boolean {
  return ref - session.updatedAt > TTL_MS
}

function isValidSession(value: unknown): value is ChatSession {
  const s = value as ChatSession
  return (
    !!s &&
    typeof s.id === "string" &&
    typeof s.updatedAt === "number" &&
    Array.isArray(s.messages)
  )
}

/**
 * Carrega as conversas, removendo as expiradas na mesma passagem e
 * reescrevendo a lista podada de volta no storage (auto-limpeza).
 * Retorna ordenado da mais recente para a mais antiga.
 */
export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const ref = Date.now()
    const alive = parsed
      .filter(isValidSession)
      .filter((s) => !isExpired(s, ref))
      .sort((a, b) => b.updatedAt - a.updatedAt)

    if (alive.length !== parsed.length) saveSessions(alive)
    return alive
  } catch {
    return []
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return
  try {
    const capped = [...sessions]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(capped))
  } catch {
    /* quota excedida ou serialização — ignora silenciosamente */
  }
}

/** Dias inteiros restantes até a expiração (arredondado para cima). */
export function daysUntilExpiry(session: ChatSession, ref = Date.now()): number {
  return Math.ceil((session.updatedAt + TTL_MS - ref) / DAY_MS)
}

/** Título derivado da primeira mensagem do usuário, truncado. */
export function makeTitle(firstUserMessage: string): string {
  const t = firstUserMessage.trim().replace(/\s+/g, " ")
  if (!t) return "Nova conversa"
  return t.length > 48 ? `${t.slice(0, 47).trimEnd()}…` : t
}

export function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
