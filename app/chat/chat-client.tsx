"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Send,
  Stethoscope,
  User,
  Info,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ChatMessage, Profile, Source } from "@/lib/types"
import { cn } from "@/lib/utils"

type DisplayMessage = ChatMessage & { sources?: Source[] }

const SUGGESTIONS = [
  "Preciso de jejum para ressonância com contraste?",
  "Como me preparo para tomografia do tórax?",
  "Quais documentos levo no dia do exame?",
  "Preciso de acompanhante na mamografia?",
]

const PROFILE_META: Record<
  Profile,
  { label: string; icon: typeof User; badgeClass: string }
> = {
  patient: {
    label: "Paciente",
    icon: User,
    badgeClass: "bg-patient-bg text-patient-border border-patient-border",
  },
  professional: {
    label: "Profissional",
    icon: Stethoscope,
    badgeClass:
      "bg-professional-bg text-professional-border border-professional-border",
  },
}

export function ChatClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const profile: Profile =
    searchParams.get("profile") === "professional" ? "professional" : "patient"

  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const meta = PROFILE_META[profile]
  const ProfileIcon = meta.icon

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isLoading])

  function switchProfile() {
    const next = profile === "patient" ? "professional" : "patient"
    router.replace(`/chat?profile=${next}`)
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const history = messages.map(({ role, content }) => ({ role, content }))
    const userMsg: DisplayMessage = { role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, profile, history }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error ?? "Erro desconhecido")
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ])
    } catch (err) {
      const detail =
        err instanceof Error && err.message ? err.message : null
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            detail ??
            "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente em instantes.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-svh bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Voltar ao início"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-lg leading-tight text-foreground truncate">
                Assistente UDI HC-UFPE
              </h1>
              <p className="text-xs text-muted-foreground">
                Preparo de exames de imagem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={switchProfile}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              meta.badgeClass,
            )}
            aria-label={`Perfil ativo: ${meta.label}. Clique para trocar.`}
          >
            <ProfileIcon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </button>
        </div>
      </header>

      {/* Warning banner */}
      <div className="shrink-0 bg-warning-bg">
        <div className="mx-auto flex max-w-2xl items-start gap-2 px-4 py-2.5">
          <Info
            className="mt-0.5 size-4 shrink-0 text-warning-foreground"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-warning-foreground">
            Este assistente fornece orientações de apoio com base na
            documentação oficial da UDI/HC-UFPE. Não substitui a orientação da
            equipe de saúde.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <ProfileIcon className="size-7" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                Olá! Como posso ajudar?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm leading-relaxed">
                Pergunte sobre jejum, contraste, documentos ou onde marcar seu
                exame. Você pode começar com uma das sugestões abaixo.
              </p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2 px-4 py-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Digite sua pergunta sobre o exame..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 max-h-32"
            aria-label="Mensagem"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="size-11 shrink-0 rounded-xl"
            aria-label="Enviar mensagem"
          >
            <Send className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card border border-border text-card-foreground rounded-bl-sm",
        )}
      >
        <FormattedContent text={message.content} isUser={isUser} />

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="size-3" aria-hidden="true" />
              Fontes:
            </span>
            {message.sources.map((src) => (
              <Badge
                key={src.sigla}
                variant="secondary"
                className="text-[10px] font-normal"
              >
                {src.nome}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function renderInline(text: string) {
  // Suporta **negrito** e _itálico_ de forma simples.
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <em key={i} className="opacity-80">
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function FormattedContent({ text, isUser }: { text: string; isUser: boolean }) {
  const lines = text.split("\n")

  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        if (trimmed === "---") {
          return (
            <hr
              key={i}
              className={cn(
                "my-2 border-t",
                isUser ? "border-primary-foreground/30" : "border-border",
              )}
            />
          )
        }

        if (trimmed === "") {
          return <div key={i} className="h-1.5" aria-hidden="true" />
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  isUser ? "bg-primary-foreground/60" : "bg-primary/60",
                )}
                aria-hidden="true"
              />
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          )
        }

        return <p key={i}>{renderInline(trimmed)}</p>
      })}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5">
        <span className="sr-only">Assistente digitando</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
