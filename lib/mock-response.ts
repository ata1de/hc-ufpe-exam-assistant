import examesData from "@/data/exames.json"
import preparosData from "@/data/preparos.json"
import { searchExames } from "@/lib/search"
import type { Exame, PreparosFile, Profile, Source } from "@/lib/types"

const exames = examesData as Exame[]
const preparos = preparosData as PreparosFile

/** Divide um bloco de orientações em itens (frases) para exibir como lista. */
function toItems(text: string): string[] {
  return text
    .split(/(?<=[.;])\s+(?=[A-ZÀ-Ú0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function phoneForModalidade(modalidade: string): string {
  const tel = preparos.meta.orientacoes_gerais.telefones
  if (/tomografia|ressonancia/.test(modalidade)) return tel.tomografia_ressonancia
  if (/ultrassonografia|densitometria/.test(modalidade)) return tel.ultrassonografia_densitometria
  if (/radiologia/.test(modalidade)) return tel.raio_x_contrastado
  return tel.imagem_geral
}

const semPreparoRegex =
  /n[aã]o\s+exige|n[aã]o\s+[eé]\s+necess[aá]rio\s+jejum|geralmente n[aã]o|n[aã]o\s+[eé]\s+necess[aá]rio\s+preparo/i

/**
 * Gera uma resposta determinística (mock) a partir dos dados dos exames,
 * respeitando as regras de segurança clínica do HC-UFPE.
 * Usada como fallback quando a IA não está disponível.
 */
export function generateMockResponse(
  message: string,
  profile: Profile,
): { reply: string; sources: Source[] } {
  const geral = preparos.meta.orientacoes_gerais
  const matched = searchExames(message, exames)

  if (matched.length === 0) {
    const reply =
      profile === "professional"
        ? "Não consegui identificar o exame na sua solicitação. Informe a sigla ou o nome do exame (ex.: TCTX, RMABDC, USABD) para que eu retorne o protocolo de preparo correspondente.\n\n" +
          `Em caso de dúvida sobre o cadastro, contato da Imagem Geral: ${geral.telefones.imagem_geral}.`
        : "Não consegui identificar o exame na sua pergunta. Você pode me dizer o nome do exame que vai realizar? Por exemplo: tomografia de tórax, ressonância de abdômen, ultrassonografia, mamografia, raio-X, densitometria.\n\n" +
          `Se preferir, ligue para a Imagem Geral do HC-UFPE: ${geral.telefones.imagem_geral}.`
    return { reply, sources: [] }
  }

  const sources: Source[] = matched.map((e) => ({ sigla: e.sigla, nome: e.nome }))
  const blocks: string[] = []

  for (const exame of matched) {
    const preparo = preparos.preparos[exame.preparo_id]
    const phone = phoneForModalidade(exame.modalidade)

    if (profile === "professional") {
      let b = `**${exame.nome} (${exame.sigla})**\n`
      b += `Modalidade: ${exame.modalidade.replace(/_/g, " ")}\n`
      b += `Protocolo: ${preparo.titulo}\n`
      b += `Status do cadastro: ${preparo.status.toUpperCase()}\n`

      if (preparo.status === "pendente") {
        b += `\nPreparo específico NÃO cadastrado. Não orientar ausência de preparo. ${preparo.fallback}`
      } else {
        b += `\nPreparo / protocolo:\n`
        b += toItems(preparo.orientacoes)
          .map((i) => `- ${i}`)
          .join("\n")
        if (preparo.observacoes) {
          b += `\n\nFluxo / observações:\n`
          b += toItems(preparo.observacoes)
            .map((i) => `- ${i}`)
            .join("\n")
        }
      }
      b += `\n\nContato do setor: ${phone}.`
      blocks.push(b)
    } else {
      // Paciente
      let b = `**${exame.nome_usual}**\n`

      if (preparo.status === "pendente") {
        b += `\n**Preparo:** ${preparo.fallback}`
        b += `\n\n**Telefone para confirmar:** ${phone}`
      } else {
        const semPreparo = preparo.status === "ok" && semPreparoRegex.test(preparo.orientacoes)
        b += `\n**Preparo:**\n`
        b += toItems(preparo.orientacoes)
          .map((i) => `- ${i}`)
          .join("\n")
        if (semPreparo) {
          b += `\n\n_Este exame, conforme nossa base, não exige preparo especial. Pode ficar tranquilo(a)._`
        }
        if (preparo.observacoes) {
          b += `\n\n**Bom saber:**\n`
          b += toItems(preparo.observacoes)
            .map((i) => `- ${i}`)
            .join("\n")
        }
        b += `\n\n**Telefone do setor:** ${phone}`
      }
      blocks.push(b)
    }
  }

  const docsBlock =
    profile === "professional"
      ? ""
      : `\n\n---\n**Documentos para levar:** documento de identificação com foto, Cartão do SUS, Cartão do Hospital e o pedido médico original. Traga também exames anteriores relacionados, se tiver.` +
        `\n\n**No dia:** chegue com 30 minutos de antecedência. Avise o setor com antecedência se você é de isolamento, acamado(a), usa oxigênio contínuo ou é obeso(a).`

  const reply = blocks.join("\n\n---\n\n") + docsBlock
  return { reply, sources }
}
