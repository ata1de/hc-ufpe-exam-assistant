import { normalize } from "./search"
import type { ExamOption } from "./exam-options"

/**
 * Agrupa exames que só diferem por eixos de variante (contraste, sedação, lado)
 * em um "exame base", para o picker guiado perguntar esses eixos em vez de
 * despejar dezenas de nomes quase idênticos.
 *
 * O agrupamento é derivado do NOME em runtime (sem colunas tipadas): os eixos
 * já estão codificados de forma regular no rótulo. Nome irregular → grupo de
 * variante única (nenhuma sub-pergunta é feita).
 */

export type VariantAxis = "contraste" | "sedacao" | "lado"
export type ContrasteValue = "com" | "sem"
export type SedacaoValue = "com" | "sem"
export type LadoValue = "direito" | "esquerdo"

export type ExamVariant = {
  exam: ExamOption
  contraste?: ContrasteValue
  sedacao?: SedacaoValue
  lado?: LadoValue
}

export type ExamGroup = {
  baseLabel: string
  baseKey: string
  variants: ExamVariant[]
  /** Eixos em que as variantes deste grupo realmente divergem. */
  axes: VariantAxis[]
}

/** Extrai os valores de eixo de variante a partir do rótulo do exame. */
export function parseVariant(exam: ExamOption): ExamVariant {
  const n = normalize(exam.label)
  const v: ExamVariant = { exam }

  if (/\bcom contraste\b|\bcom contrate\b/.test(n)) v.contraste = "com"
  else if (/\bsem contraste\b/.test(n)) v.contraste = "sem"

  if (/\bcom sedacao\b/.test(n)) v.sedacao = "com"
  else if (/\bsem sedacao\b/.test(n)) v.sedacao = "sem"

  if (/\b(direito|direita)\b/.test(n)) v.lado = "direito"
  else if (/\b(esquerdo|esquerda)\b/.test(n)) v.lado = "esquerdo"

  return v
}

const VARIANT_PATTERNS: RegExp[] = [
  /\bcom contraste\b/gi,
  /\bsem contraste\b/gi,
  /\bcom contrate\b/gi,
  /\be com sedacao\b/gi,
  /\be sem sedacao\b/gi,
  /\bcom sedacao e sem contraste\b/gi,
  /\bcom sedacao\b/gi,
  /\bsem sedacao\b/gi,
  /\b(direito|direita|esquerdo|esquerda)\b/gi,
]

/** Remove sufixos de variante do rótulo (normalizado) → chave/rótulo base. */
export function stripVariantSuffixes(label: string): string {
  let n = normalize(label)
  for (const re of VARIANT_PATTERNS) n = n.replace(re, " ")
  // remove conectivos órfãos deixados pela remoção ("... da mao e" → "... da mao")
  n = n.replace(/\s+/g, " ").trim()
  n = n.replace(/\b(e|com|sem|de|da|do)\s*$/i, "").trim()
  return n
}

/**
 * Agrupa por rótulo base. `axes` lista só os eixos que divergem dentro do grupo
 * (se todas as variantes são "sem contraste", contraste não vira pergunta).
 * Grupos preservam a ordem de primeira aparição; nomes irregulares viram grupo
 * de variante única.
 */
export function groupExams(exams: ExamOption[]): ExamGroup[] {
  const order: string[] = []
  const byKey = new Map<string, { baseLabel: string; variants: ExamVariant[] }>()

  for (const exam of exams) {
    const baseKey = stripVariantSuffixes(exam.label)
    if (!byKey.has(baseKey)) {
      byKey.set(baseKey, { baseLabel: baseLabelFor(exam.label), variants: [] })
      order.push(baseKey)
    }
    byKey.get(baseKey)!.variants.push(parseVariant(exam))
  }

  return order.map((baseKey) => {
    const { baseLabel, variants } = byKey.get(baseKey)!
    return { baseKey, baseLabel, variants, axes: axesFor(variants) }
  })
}

/** Rótulo base amigável: pega o rótulo original e apara os sufixos de variante. */
function baseLabelFor(label: string): string {
  // Trabalha sobre o rótulo original (com acentos/caixa) para preservar a grafia,
  // cortando a partir da 1ª palavra de variante encontrada.
  const markers = [
    /\s+com contraste\b/i,
    /\s+sem contraste\b/i,
    /\s+com contrate\b/i,
    /\s+com seda[cç][aã]o\b/i,
    /\s+sem seda[cç][aã]o\b/i,
    /\s+e com seda[cç][aã]o\b/i,
    /\s+e sem seda[cç][aã]o\b/i,
    /\s+(direito|direita|esquerdo|esquerda)\b/i,
  ]
  let cut = label.length
  for (const re of markers) {
    const m = label.match(re)
    if (m && m.index !== undefined && m.index < cut) cut = m.index
  }
  let out = label.slice(0, cut).trim()
  // apara conectivo órfão final ("... da mão e" → "... da mão")
  out = out.replace(/\s+(e|com|sem|de|da|do)$/i, "").trim()
  return out || label
}

/** Determina quais eixos divergem entre as variantes do grupo. */
function axesFor(variants: ExamVariant[]): VariantAxis[] {
  const axes: VariantAxis[] = []
  const distinct = (key: keyof ExamVariant) =>
    new Set(variants.map((v) => v[key]).filter((x) => x !== undefined))

  if (distinct("contraste").size > 1) axes.push("contraste")
  if (distinct("sedacao").size > 1) axes.push("sedacao")
  if (distinct("lado").size > 1) axes.push("lado")
  return axes
}
