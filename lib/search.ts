import type { Exame } from "./types"

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Busca textual normalizada em sigla, nome, nome_usual e sinonimos.
 * Retorna até 3 candidatos ordenados por relevância.
 */
export function searchExames(query: string, exames: Exame[]): Exame[] {
  const q = normalize(query)
  if (!q) return []

  const tokens = q.split(" ").filter((t) => t.length > 1)

  const scored = exames
    .map((exame) => {
      const fields = [
        exame.sigla,
        exame.nome,
        exame.nome_usual,
        ...exame.sinonimos,
      ].map(normalize)

      const haystack = fields.join(" ")
      let score = 0

      // Correspondência exata da sigla
      if (fields[0] && q.includes(fields[0])) score += 50

      // Correspondência de campo completo
      for (const field of fields) {
        if (field && q.includes(field)) score += 30
        if (field && field.includes(q)) score += 20
      }

      // Correspondência por tokens
      for (const token of tokens) {
        if (haystack.includes(token)) score += 5
      }

      return { exame, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map((s) => s.exame)
}
