import { describe, it, expect } from "vitest"
import { stemToken, stemQuery } from "./stem"

describe("stemToken", () => {
  it("singulariza plural regular", () => {
    expect(stemToken("ressonancias")).toBe("ressonancia")
    expect(stemToken("tomografias")).toBe("tomografia")
    expect(stemToken("exames")).toBe("exame")
    expect(stemToken("quantos")).toBe("quanto")
    expect(stemToken("quantas")).toBe("quanta")
  })

  it("trata plurais irregulares comuns", () => {
    expect(stemToken("regioes")).toBe("regiao")
    expect(stemToken("abdominais")).toBe("abdominal")
    expect(stemToken("mulheres")).toBe("mulher")
  })

  it("dobra verbos de preparo do plural para o singular", () => {
    expect(stemToken("precisam")).toBe("precisa")
    expect(stemToken("exigem")).toBe("exige")
    expect(stemToken("necessitam")).toBe("necessita")
    expect(stemToken("requerem")).toBe("requer")
  })

  it("NÃO trunca tokens curtos (siglas)", () => {
    expect(stemToken("rm")).toBe("rm")
    expect(stemToken("tc")).toBe("tc")
    expect(stemToken("us")).toBe("us")
    expect(stemToken("os")).toBe("os")
    expect(stemToken("as")).toBe("as")
  })
})

describe("stemQuery", () => {
  it("aplica por token", () => {
    expect(stemQuery("liste as ressonancias")).toBe("liste as ressonancia")
    expect(stemQuery("quantas tomografias")).toBe("quanta tomografia")
  })
})
