export type Profile = "patient" | "professional"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type PreparoStatus = "ok" | "parcial" | "pendente"

export type Exame = {
  sigla: string
  nome: string
  nome_usual: string
  sinonimos: string[]
  modalidade: string
  preparo_id: string
}

export type Preparo = {
  titulo: string
  orientacoes: string
  status: PreparoStatus
  observacoes?: string
  fallback?: string
}

export type FluxoRaiox = {
  titulo: string
  passos: string[]
  telefone: string
}

export type PreparosFile = {
  meta: {
    orientacoes_gerais: {
      titulo: string
      orientacoes: string
      telefones: Record<string, string>
    }
    fluxo_raiox?: FluxoRaiox
  }
  preparos: Record<string, Preparo>
}

export type Source = {
  nome: string
}

export type StoredMessage = ChatMessage & {
  sources?: Source[]
}

export type ChatSession = {
  id: string
  profile: Profile
  title: string
  messages: StoredMessage[]
  createdAt: number
  updatedAt: number
}
