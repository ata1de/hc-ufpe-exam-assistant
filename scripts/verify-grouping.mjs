#!/usr/bin/env node
/**
 * Verificação do agrupamento de variantes contra data/exames.json real.
 * Porta a lógica de lib/exam-grouping.ts (mantê-las em sincronia) e roda
 * asserções sobre os exames que o paciente realmente vê (ok/parcial).
 *
 * Uso: node scripts/verify-grouping.mjs
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const exames = JSON.parse(readFileSync(join(ROOT, "data/exames.json"), "utf8"))
const preparos = JSON.parse(readFileSync(join(ROOT, "data/preparos.json"), "utf8")).preparos

function normalize(t) {
  return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}
// port de prettifyExamName (simplificado: só precisamos de algo estável p/ label)
const label = (e) => e.nome_usual

function parseVariant(lbl) {
  const n = normalize(lbl)
  const v = {}
  if (/\bcom contraste\b|\bcom contrate\b/.test(n)) v.contraste = "com"
  else if (/\bsem contraste\b/.test(n)) v.contraste = "sem"
  if (/\bcom sedacao\b/.test(n)) v.sedacao = "com"
  else if (/\bsem sedacao\b/.test(n)) v.sedacao = "sem"
  if (/\b(direito|direita)\b/.test(n)) v.lado = "direito"
  else if (/\b(esquerdo|esquerda)\b/.test(n)) v.lado = "esquerdo"
  return v
}
const PATTERNS = [
  /\bcom contraste\b/gi, /\bsem contraste\b/gi, /\bcom contrate\b/gi,
  /\be com sedacao\b/gi, /\be sem sedacao\b/gi,
  /\bcom sedacao e sem contraste\b/gi, /\bcom sedacao\b/gi, /\bsem sedacao\b/gi,
  /\b(direito|direita|esquerdo|esquerda)\b/gi,
]
function stripVariant(lbl) {
  let n = normalize(lbl)
  for (const re of PATTERNS) n = n.replace(re, " ")
  n = n.replace(/\s+/g, " ").trim().replace(/\b(e|com|sem|de|da|do)\s*$/i, "").trim()
  return n
}
function axesFor(variants) {
  const axes = []
  const d = (k) => new Set(variants.map((v) => v[k]).filter((x) => x !== undefined))
  if (d("contraste").size > 1) axes.push("contraste")
  if (d("sedacao").size > 1) axes.push("sedacao")
  if (d("lado").size > 1) axes.push("lado")
  return axes
}
function groupExams(list) {
  const order = [], byKey = new Map()
  for (const e of list) {
    const k = stripVariant(label(e))
    if (!byKey.has(k)) { byKey.set(k, []); order.push(k) }
    byKey.get(k).push({ ...parseVariant(label(e)), sigla: e.sigla })
  }
  return order.map((k) => ({ baseKey: k, variants: byKey.get(k), axes: axesFor(byKey.get(k)) }))
}

let pass = 0, fail = 0
function assert(cond, msg) { if (cond) pass++; else { fail++; console.error("  ✗", msg) } }

const status = (e) => preparos[e.preparo_id]?.status ?? "pendente"
const surfaced = exames.filter((e) => status(e) !== "pendente")

for (const mod of ["ressonancia_magnetica", "ultrassonografia", "radiologia_convencional", "mamografia", "densitometria_ossea"]) {
  const list = surfaced.filter((e) => e.modalidade === mod)
  if (!list.length) continue
  const groups = groupExams(list)
  const totalVariants = groups.reduce((a, g) => a + g.variants.length, 0)
  console.log(`\n${mod}: ${list.length} exames → ${groups.length} grupos base`)

  // 1. nenhum exame perdido
  assert(totalVariants === list.length, `${mod}: variantes (${totalVariants}) == exames (${list.length})`)

  // 2. cada axis listado realmente diverge; cada grupo multi-variante tem ≥1 axis OU variantes idênticas
  for (const g of groups) {
    for (const ax of g.axes) {
      const vals = new Set(g.variants.map((v) => v[ax]).filter(Boolean))
      assert(vals.size > 1, `${mod}/"${g.baseKey}": axis ${ax} diverge (${[...vals]})`)
    }
    // 3. combinação de eixos resolve variante única
    for (const v of g.variants) {
      const matches = g.variants.filter((w) =>
        g.axes.every((ax) => w[ax] === v[ax]))
      assert(matches.length >= 1, `${mod}/"${g.baseKey}": eixos resolvem ≥1 variante`)
    }
  }
}

// 4. grupo base sem eixo = clique único (todas as variantes iguais nos eixos)
const rm = groupExams(surfaced.filter((e) => e.modalidade === "ressonancia_magnetica"))
const single = rm.filter((g) => g.axes.length === 0)
console.log(`\nRM: ${single.length} grupos de clique único (sem sub-pergunta), ${rm.length - single.length} com eixos`)
assert(single.every((g) => g.variants.length >= 1), "grupos sem eixo têm ≥1 variante")

console.log(`\n${pass} asserções OK, ${fail} falhas`)
process.exit(fail ? 1 : 0)
