import examesData from "@/data/exames.json"
import preparosData from "@/data/preparos.json"
import type { Exame, PreparosFile, PreparoStatus } from "./types"

const exames = examesData as Exame[]
const preparos = preparosData as PreparosFile

export type ModalidadeOption = {
  modalidade: string
  label: string
  count: number
  /** Quando a modalidade tem 1 só exame, vai direto para ele (sem passo 2). */
  singleExam?: ExamOption
}

export type ExamOption = {
  sigla: string
  label: string
  query: string
  status: PreparoStatus
}

// Rótulos amigáveis por modalidade (não expor o enum cru ao paciente).
const MODALIDADE_LABELS: Record<string, string> = {
  tomografia_computadorizada: "Tomografia (TC)",
  ressonancia_magnetica: "Ressonância (RM)",
  ultrassonografia: "Ultrassom",
  radiologia_convencional: "Raio-X",
  mamografia: "Mamografia",
  densitometria_ossea: "Densitometria óssea",
  medicina_nuclear: "Medicina nuclear",
}

// Ordem fixa (mais comum primeiro). Modalidades fora desta lista vão para o fim.
const MODALIDADE_ORDER = [
  "tomografia_computadorizada",
  "ressonancia_magnetica",
  "ultrassonografia",
  "radiologia_convencional",
  "mamografia",
  "densitometria_ossea",
  "medicina_nuclear",
]

export function modalidadeLabel(m: string): string {
  return (
    MODALIDADE_LABELS[m] ??
    m
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

// Siglas/acrônimos que devem permanecer em CAIXA ALTA no rótulo do exame.
const KEEP_UPPER = new Set(["US", "RX", "TC", "RM", "HSG", "HC", "UFPE", "SUS"])
// Conectivos que permanecem em minúscula (exceto na 1ª palavra).
const KEEP_LOWER = new Set(["de", "da", "do", "das", "dos", "com", "sem", "e", "para"])

/**
 * Os nomes na base estão em CAIXA ALTA. Converte para uma forma legível,
 * mantendo acrônimos em maiúscula e conectivos em minúscula.
 * Ex.: "URETROCISTOGRAFIA MICCIONAL (ADULTO)" -> "Uretrocistografia Miccional (Adulto)"
 */
export function prettifyExamName(nomeUsual: string): string {
  const words = nomeUsual.trim().toLowerCase().split(/\s+/)
  return words
    .map((word, i) => prettifyWord(word, i === 0))
    .join(" ")
}

function prettifyWord(word: string, isFirst: boolean): string {
  // Trata parênteses: "(adulto)" -> "(Adulto)"
  const m = word.match(/^(\(*)([^()]*)(\)*)$/)
  if (!m) return capitalize(word)
  const [, open, core, close] = m
  const upperCore = core.toUpperCase()

  let out: string
  if (KEEP_UPPER.has(upperCore)) {
    out = upperCore
  } else if (!isFirst && open === "" && KEEP_LOWER.has(core)) {
    out = core
  } else {
    out = capitalize(core)
  }
  return `${open}${out}${close}`
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** `Como me preparo para <nome_usual em minúsculas>?` — resolve top-1 no searchExames. */
export function buildQuery(e: Exame): string {
  return `Como me preparo para ${e.nome_usual.toLowerCase()}?`
}

function toExamOption(e: Exame): ExamOption {
  const status = preparos.preparos[e.preparo_id]?.status ?? "pendente"
  return {
    sigla: e.sigla,
    label: prettifyExamName(e.nome_usual),
    query: buildQuery(e),
    status,
  }
}

// Só expomos exames que têm orientação de preparo (ok/parcial).
// Exames "pendente" não têm conteúdo, então não viram botão — evita
// que o paciente clique e chegue num beco sem orientação.
export function getExamsForModalidade(modalidade: string): ExamOption[] {
  return exames
    .filter((e) => e.modalidade === modalidade)
    .map(toExamOption)
    .filter((ex) => ex.status !== "pendente")
}

export function getModalidades(): ModalidadeOption[] {
  const present = Array.from(new Set(exames.map((e) => e.modalidade)))
  present.sort((a, b) => {
    const ia = MODALIDADE_ORDER.indexOf(a)
    const ib = MODALIDADE_ORDER.indexOf(b)
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
  })

  return present
    .map((modalidade) => {
      const list = getExamsForModalidade(modalidade)
      return {
        modalidade,
        label: modalidadeLabel(modalidade),
        count: list.length,
        singleExam: list.length === 1 ? list[0] : undefined,
      }
    })
    // Modalidade sem nenhum exame com preparo some do passo 1.
    .filter((m) => m.count > 0)
}
