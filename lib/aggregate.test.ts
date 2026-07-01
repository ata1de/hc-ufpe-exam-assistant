import { describe, it, expect } from "vitest"
import {
  parseFilter,
  wantsAggregateCount,
  wantsAggregateList,
} from "./aggregate"

describe("bug de plural — modalidade (regressão)", () => {
  it("singular casa modalidade RM", () => {
    expect(parseFilter("liste a ressonância").modalidade).toBe(
      "ressonancia_magnetica",
    )
  })

  it("PLURAL também casa modalidade RM (o bug relatado)", () => {
    expect(parseFilter("liste as ressonâncias").modalidade).toBe(
      "ressonancia_magnetica",
    )
    expect(parseFilter("quantas tomografias tem").modalidade).toBe(
      "tomografia_computadorizada",
    )
  })
})

describe("wantsAggregateList / wantsAggregateCount com plural", () => {
  it("listagem verdadeira para frase no plural", () => {
    expect(wantsAggregateList("liste as ressonâncias")).toBe(true)
    expect(wantsAggregateList("mostre as tomografias")).toBe(true)
  })

  it("contagem verdadeira para frase no plural", () => {
    expect(wantsAggregateCount("quantas ressonâncias tem")).toBe(true)
    expect(wantsAggregateCount("quantos exames de tomografia")).toBe(true)
  })
})

describe("needFilter — comportamento inalterado", () => {
  it("distingue precisam / não precisam / ambos", () => {
    expect(parseFilter("exames que precisam de preparo").need).toBe("needs")
    expect(parseFilter("exames que não precisam de preparo").need).toBe("none")
    expect(
      parseFilter("quantos precisam e quantos não precisam").need,
    ).toBeUndefined()
  })
})
