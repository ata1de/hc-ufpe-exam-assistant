/**
 * Stemmer PT-BR leve e conservador — dobra flexões comuns (plural, alguns
 * gêneros e os verbos de preparo) a uma forma canônica, para que a detecção de
 * intenção por regex (lib/aggregate.ts) e a busca (lib/search.ts) não quebrem
 * quando o usuário escreve no plural.
 *
 * Motivação (bug real): `/\bressonancia\b/` não casa "ressonancias", então
 * "liste as ressonâncias" falhava enquanto "liste a ressonância" funcionava.
 *
 * NÃO é um RSLP/Snowball completo — de propósito. Um stemmer agressivo remove
 * sufixos médicos significativos e provoca colisões. Aqui só tratamos plural/
 * gênero REGULAR e uma whitelist de verbos. Opera sobre tokens já normalizados
 * (minúsculos, sem acento) — ver normalize() em lib/search.ts.
 */

// Verbos de preparo no plural → singular (whitelist explícita, sem conjugação
// genérica). Mantém a segurança: só dobramos o que conhecemos.
const VERB_PLURAL: Record<string, string> = {
  precisam: "precisa",
  exigem: "exige",
  necessitam: "necessita",
  requerem: "requer",
  possuem: "possui",
  fazem: "faz",
}

/**
 * Reduz um token à sua forma singular canônica. Conservador: tokens curtos
 * (<= 3, ex.: "us", "rm", "tc", "os", "as") nunca são truncados.
 */
export function stemToken(t: string): string {
  if (VERB_PLURAL[t]) return VERB_PLURAL[t]
  if (t.length <= 3) return t

  // Plurais irregulares regulares do PT: -oes/-aes/-ais/-eis/-ois → singular.
  if (t.endsWith("oes")) return t.slice(0, -3) + "ao" // ex.: regioes -> regiao
  if (t.endsWith("aes")) return t.slice(0, -3) + "ao" // ex.: paes -> pao
  if (/[aeiou]is$/.test(t)) return t.slice(0, -2) + "l" // ex.: abdominais -> abdominal
  if (t.endsWith("ns")) return t.slice(0, -2) + "m" // ex.: bens -> bem
  if (t.endsWith("res")) return t.slice(0, -2) // ex.: mulheres -> mulher

  // Plural regular: remove "s" final (só quando sobra token >= 3).
  if (t.endsWith("s") && t.length >= 4) return t.slice(0, -1)

  return t
}

/** Aplica stemToken a cada token de uma string normalizada. */
export function stemQuery(q: string): string {
  return q
    .split(" ")
    .map(stemToken)
    .join(" ")
}
