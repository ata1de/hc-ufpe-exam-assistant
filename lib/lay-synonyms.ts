/**
 * Mapa de linguagem LEIGA → termos TÉCNICOS presentes na base de exames.
 *
 * Os nomes na base são técnicos, em CAIXA ALTA e sem acento ("TORAX",
 * "CRANIO", "ABDOMEN"). O paciente digita "peito", "cabeça", "barriga". Sem
 * ponte, a busca (lib/search.ts) não casa nada.
 *
 * Estratégia: EXPANSÃO de query — quando um token da pergunta é um termo leigo
 * conhecido, ACRESCENTAMOS os termos técnicos aos tokens de busca (não
 * substituímos). Assim evitamos editar ~800 registros ou mexer no campo
 * `sinonimos` (parte do contrato de ingestão).
 *
 * SEGURANÇA CLÍNICA:
 * - Chave leiga só mapeia REGIÃO anatômica, não modalidade. A modalidade
 *   ("raio-x", "ressonância") vem de outro token. "peito"/"cabeça" existem em
 *   várias modalidades na base — a desambiguação depende do resto da frase ou
 *   do picker guiado. Por isso os tokens injetados pontuam com peso REDUZIDO em
 *   lib/search.ts (não o suficiente, sozinhos, para responder com confiança).
 * - Não incluir termo leigo que aponte para exames com preparos conflitantes
 *   sem que compartilhem intenção — na dúvida, omitir (preferir "não encontrado"
 *   a preparo errado).
 *
 * Chaves e valores em minúsculas, sem acento (mesma forma que normalize()).
 */
export const LAY_SYNONYMS: Record<string, string[]> = {
  // Tórax / peito
  peito: ["torax"],
  peitoral: ["torax"],
  pulmao: ["torax"],
  pulmoes: ["torax"],

  // Crânio / cabeça
  cabeca: ["cranio", "encefalo"],
  cerebro: ["cranio", "encefalo"],

  // Abdômen / barriga
  barriga: ["abdomen", "abdominal"],
  estomago: ["abdomen", "estomago"],

  // Pescoço
  pescoco: ["cervical", "cervicais"],

  // Rim / vias urinárias
  rim: ["renal", "urinario"],
  rins: ["renal", "urinario"],

  // Útero / pelve
  utero: ["pelvica", "pelvis"],
  ovario: ["pelvica", "pelvis"],
  ovarios: ["pelvica", "pelvis"],

  // Mama / seio
  seio: ["mama", "mamaria"],
  seios: ["mama", "mamaria"],
}

/**
 * Para cada token, se for uma chave leiga conhecida, retorna os termos técnicos
 * correspondentes. Devolve a lista de tokens INJETADOS (sem os originais),
 * deduplicada e sem repetir termos já presentes na query.
 */
export function expandLayTerms(tokens: string[]): string[] {
  const present = new Set(tokens)
  const injected = new Set<string>()
  for (const t of tokens) {
    const syns = LAY_SYNONYMS[t]
    if (!syns) continue
    for (const s of syns) {
      if (!present.has(s)) injected.add(s)
    }
  }
  return Array.from(injected)
}
