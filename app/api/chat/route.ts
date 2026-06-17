import { createAnthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import examesData from "@/data/exames.json"
import preparosData from "@/data/preparos.json"
import { searchExames } from "@/lib/search"
import { generateMockResponse } from "@/lib/mock-response"
import type { ChatMessage, Exame, PreparosFile, Profile, Source } from "@/lib/types"

export const runtime = "nodejs"

const exames = examesData as Exame[]
const preparos = preparosData as PreparosFile

const SYSTEM_PROMPTS: Record<Profile, string> = {
  patient:
    "Você é um assistente da Unidade de Diagnóstico por Imagem (UDI) do HC-UFPE. " +
    "Responda APENAS com base no CONTEXTO fornecido. Use linguagem simples, clara e acolhedora. " +
    "Estruture a resposta em: (1) Preparo, (2) Documentos, (3) O que levar/não fazer, (4) Onde marcar/contato. " +
    "Se o contexto for de status PENDENTE, NÃO afirme que o exame dispensa preparo — oriente o paciente a ligar para o setor responsável informando o telefone fornecido. " +
    "NUNCA dê diagnóstico, recomendação clínica ou invente dosagens, jejuns ou medicações. " +
    "Se a informação não estiver no contexto, diga 'Não tenho essa informação na minha base, por favor confirme pelo telefone [X]'.",
  professional:
    "Você é um assistente da UDI do HC-UFPE. Responda APENAS com base no CONTEXTO fornecido. " +
    "Use linguagem técnica e operacional, mantendo dosagens, horários e nomes de medicamentos exatamente como no contexto. " +
    "Inclua: protocolo de preparo, contraste (tipo e necessidade), restrições e contraindicações, fluxo de agendamento (AGHU/APAC), observações específicas. " +
    "Em status PENDENTE: explicite que o preparo específico ainda não está cadastrado e direcione ao setor pelo telefone fornecido. " +
    "NUNCA invente informações fora do contexto.",
}

function buildContext(matched: Exame[]): { context: string; sources: Source[] } {
  const geral = preparos.meta.orientacoes_gerais
  const telefones = geral.telefones

  // Camada 1 — sempre presente
  let context = `### CAMADA 1 — ORIENTAÇÕES GERAIS (válidas para todos os exames)\n`
  context += `${geral.titulo}\n${geral.orientacoes}\n\n`
  context += `Telefones dos setores:\n`
  for (const [setor, tel] of Object.entries(telefones)) {
    context += `- ${setor.replace(/_/g, " ")}: ${tel}\n`
  }
  context += `\n`

  const sources: Source[] = []

  if (matched.length === 0) {
    context += `### CAMADA 2 — PREPARO ESPECÍFICO\nNenhum exame foi identificado claramente na pergunta do usuário. Peça que ele confirme o nome do exame.\n`
    return { context, sources }
  }

  context += `### CAMADA 2 — PREPARO ESPECÍFICO DO(S) EXAME(S) IDENTIFICADO(S)\n`

  for (const exame of matched) {
    const preparo = preparos.preparos[exame.preparo_id]
    sources.push({ sigla: exame.sigla, nome: exame.nome })

    context += `\n--- Exame: ${exame.nome} (${exame.sigla}) | Modalidade: ${exame.modalidade} ---\n`
    context += `Título do preparo: ${preparo.titulo}\n`
    context += `STATUS: ${preparo.status.toUpperCase()}\n`

    if (preparo.status === "pendente") {
      context += `INSTRUÇÃO OBRIGATÓRIA: Este preparo NÃO está cadastrado. NÃO diga que o exame dispensa preparo. Use exatamente esta orientação de fallback e informe o telefone:\n`
      context += `FALLBACK: ${preparo.fallback}\n`
    } else {
      context += `ORIENTAÇÕES (status ${preparo.status} — informação confirmada): ${preparo.orientacoes}\n`
      if (preparo.observacoes) {
        context += `OBSERVAÇÕES: ${preparo.observacoes}\n`
      }
      if (preparo.status === "ok" && /n[aã]o\s+exige|n[aã]o\s+[eé]\s+necess[aá]rio\s+jejum|geralmente n[aã]o/i.test(preparo.orientacoes)) {
        context += `NOTA: Este exame COMPROVADAMENTE não exige preparo (informação confirmada na base). Deixe isso claro e tranquilo para o usuário — é diferente de "preparo não cadastrado".\n`
      }
    }
  }

  return { context, sources }
}

export async function POST(req: Request) {
  let fallbackMessage = ""
  let fallbackProfile: Profile = "patient"
  try {
    const body = (await req.json()) as {
      message: string
      profile: Profile
      history: ChatMessage[]
    }

    const { message, profile = "patient", history = [] } = body
    fallbackMessage = message
    fallbackProfile = profile

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Mensagem inválida." }, { status: 400 })
    }

    if (!process.env.CLAUDE_API_KEY) {
      // Sem chave configurada: usa resposta determinística a partir da base.
      const mock = generateMockResponse(message, profile)
      return Response.json({ reply: mock.reply, sources: mock.sources, mocked: true })
    }

    const anthropic = createAnthropic({ apiKey: process.env.CLAUDE_API_KEY })

    const matched = searchExames(message, exames)
    const { context, sources } = buildContext(matched)

    const system = `${SYSTEM_PROMPTS[profile] ?? SYSTEM_PROMPTS.patient}\n\n=== CONTEXTO ===\n${context}\n=== FIM DO CONTEXTO ===`

    const recentHistory = history.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-5"),
      system,
      messages: [...recentHistory, { role: "user", content: message }],
      temperature: 0.2,
      maxOutputTokens: 1000,
    })

    return Response.json({ reply: text, sources })
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    console.log("[v0] /api/chat IA indisponível, usando fallback determinístico:", raw)

    // IA indisponível (saldo, autenticação, rede, etc.): responde a partir da base.
    if (fallbackMessage) {
      const mock = generateMockResponse(fallbackMessage, fallbackProfile)
      return Response.json({ reply: mock.reply, sources: mock.sources, mocked: true })
    }
    return Response.json(
      { error: "Erro ao processar a solicitação. Tente novamente." },
      { status: 500 },
    )
  }
}
