"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { ChatSession, Profile, StoredMessage } from "@/lib/types"
import {
  loadSessions,
  makeTitle,
  newId,
  saveSessions,
} from "@/lib/chat-storage"

export type UseChatSessions = {
  /** true after the first client-side hydration from localStorage. */
  hydrated: boolean
  sessions: ChatSession[]
  activeId: string | null
  activeMessages: StoredMessage[]
  /** Start a fresh, empty conversation (not persisted until first message). */
  newChat: () => void
  selectChat: (id: string) => void
  deleteChat: (id: string) => void
  /**
   * Persist the full message list for the active conversation. Creates the
   * session on the first turn (deriving its title) and bumps updatedAt so the
   * TTL clock resets on every activity.
   */
  commitMessages: (messages: StoredMessage[], profile: Profile) => void
}

export function useChatSessions(): UseChatSessions {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Espelha o activeId num ref para que commitMessages leia o valor atual mesmo
  // quando chamado duas vezes em torno de um await (cria no 1º turno, depois
  // anexa a resposta).
  const activeIdRef = useRef<string | null>(null)
  const setActive = useCallback((id: string | null) => {
    activeIdRef.current = id
    setActiveId(id)
  }, [])

  // Hidrata uma vez após montar — mantém o SSR estável e remove conversas expiradas.
  useEffect(() => {
    setSessions(loadSessions())
    setHydrated(true)
  }, [])

  const activeMessages =
    sessions.find((s) => s.id === activeId)?.messages ?? []

  const newChat = useCallback(() => setActive(null), [setActive])

  const selectChat = useCallback((id: string) => setActive(id), [setActive])

  const deleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id)
        saveSessions(next)
        return next
      })
      // Excluir a conversa aberta volta para uma conversa vazia.
      if (activeIdRef.current === id) setActive(null)
    },
    [setActive],
  )

  const commitMessages = useCallback(
    (messages: StoredMessage[], profile: Profile) => {
      if (messages.length === 0) return
      const ts = Date.now()
      const currentId = activeIdRef.current

      setSessions((prev) => {
        const existing = currentId
          ? prev.find((s) => s.id === currentId)
          : null

        if (existing) {
          const next = prev.map((s) =>
            s.id === existing.id ? { ...s, messages, updatedAt: ts } : s,
          )
          saveSessions(next)
          return next
        }

        // Primeiro turno de uma conversa nova → cria e ativa a sessão.
        const id = newId()
        const firstUser = messages.find((m) => m.role === "user")
        const session: ChatSession = {
          id,
          profile,
          title: makeTitle(firstUser?.content ?? ""),
          messages,
          createdAt: ts,
          updatedAt: ts,
        }
        setActive(id)
        const next = [session, ...prev]
        saveSessions(next)
        return next
      })
    },
    [setActive],
  )

  return {
    hydrated,
    sessions,
    activeId,
    activeMessages,
    newChat,
    selectChat,
    deleteChat,
    commitMessages,
  }
}
