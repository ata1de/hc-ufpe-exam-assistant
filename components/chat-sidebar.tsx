"use client"

import { MessageSquare, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { daysUntilExpiry } from "@/lib/chat-storage"
import type { ChatSession } from "@/lib/types"
import { cn } from "@/lib/utils"

type ChatSidebarProps = {
  sessions: ChatSession[]
  activeId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function ChatSidebar({
  sessions,
  activeId,
  open,
  onOpenChange,
  onNewChat,
  onSelect,
  onDelete,
}: ChatSidebarProps) {
  return (
    <>
      {/* Desktop: fixed column */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarBody
          sessions={sessions}
          activeId={activeId}
          onNewChat={onNewChat}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </aside>

      {/* Mobile: off-canvas drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => onOpenChange(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-label="Histórico de conversas"
        >
          <div className="flex items-center justify-between px-3 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
              Conversas
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1 text-steel transition-colors hover:bg-mist hover:text-azure-deep"
              aria-label="Fechar histórico"
            >
              <X className="size-5" />
            </button>
          </div>
          <SidebarBody
            sessions={sessions}
            activeId={activeId}
            onNewChat={onNewChat}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        </aside>
      </div>
    </>
  )
}

type SidebarBodyProps = Pick<
  ChatSidebarProps,
  "sessions" | "activeId" | "onNewChat" | "onSelect" | "onDelete"
>

function SidebarBody({
  sessions,
  activeId,
  onNewChat,
  onSelect,
  onDelete,
}: SidebarBodyProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nova conversa
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {sessions.length === 0 ? (
          <p className="px-2 py-4 text-xs leading-relaxed text-steel">
            Nenhuma conversa salva ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sessions.map((session) => (
              <li key={session.id}>
                <SidebarRow
                  session={session}
                  active={session.id === activeId}
                  onSelect={() => onSelect(session.id)}
                  onDelete={() => onDelete(session.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  )
}

function SidebarRow({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: ChatSession
  active: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const days = daysUntilExpiry(session)
  const soon = days <= 1
  const expiryText =
    days <= 0
      ? "Expira hoje"
      : days === 1
        ? "Expira amanhã"
        : `Expira em ${days} dias`

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 rounded-lg pr-1 transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/60",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"
      >
        <MessageSquare
          className="size-4 shrink-0 text-steel"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm">{session.title}</span>
          <span
            className={cn(
              "block font-mono text-[10px] uppercase tracking-wide",
              soon ? "text-warning-foreground" : "text-steel",
            )}
          >
            {expiryText}
          </span>
        </span>
      </button>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-steel opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={`Excluir conversa: ${session.title}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
          <AlertDialogDescription>
            A conversa &ldquo;{session.title}&rdquo; será removida
            permanentemente. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
