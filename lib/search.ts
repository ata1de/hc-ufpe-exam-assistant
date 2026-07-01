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

// Palavras comuns em perguntas que N\u00c3O identificam um exame. N\u00e3o pontuam sozinhas
// \u2014 evita que "me explique os documentos para levar" case com um exame aleat\u00f3rio.
const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "um", "uma",
  "para", "por", "com", "sem", "em", "no", "na", "nos", "nas", "ao", "aos",
  "que", "qual", "quais", "quanto", "quantos", "quando", "onde", "como",
  "me", "meu", "minha", "eu", "voce", "se", "sobre", "mais", "menos", "muito",
  "explique", "explica", "explicar", "detalhado", "detalhada", "detalhe",
  "detalhes", "informacao", "informacoes", "informe", "diga", "fale", "quero",
  "saber", "gostaria", "preciso", "pode", "poderia", "favor", "obrigado",
  "exame", "exames", "documento", "documentos", "levar", "trazer", "preparo",
  "preparos", "orientacao", "orientacoes", "dia", "antes", "depois", "isso",
  "este", "esse", "esta", "essa", "isto", "tudo", "todos", "todas",
])

/**
 * Busca textual normalizada em sigla, nome, nome_usual e sinonimos.
 * Retorna até 3 candidatos ordenados por relevância.
 */
export function searchExames(query: string, exames: Exame[]): Exame[] {
  const q = normalize(query)
  if (!q) return []

  // Tokens que identificam exame: >1 char e não são stopwords genéricas.
  const tokens = q
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))

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

      // Correspondência por tokens significativos (stopwords não pontuam)
      for (const token of tokens) {
        if (haystack.includes(token)) score += 5
      }

      return { exame, score }
    })
    // Exige sinal real: pelo menos um token significativo ou match de campo.
    // Sem isso, "os documentos para levar" (só stopwords) não casa nada.
    .filter((s) => s.score > 0 && (tokens.length > 0 || s.score >= 20))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map((s) => s.exame)
}
