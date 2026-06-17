import Link from "next/link"
import { Stethoscope, User, ArrowRight, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-5">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            HC-UFPE · Unidade de Diagnóstico por Imagem
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground text-balance leading-tight">
            Assistente UDI HC-UFPE
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground text-pretty max-w-xl mx-auto leading-relaxed">
            Tire suas dúvidas sobre o preparo dos exames de imagem. Escolha
            abaixo o seu perfil para começar.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/chat?profile=patient"
            className="group flex flex-col rounded-2xl border-2 bg-patient-bg border-patient-border p-6 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-card text-patient-border shadow-sm">
              <User className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-patient-border">
              Paciente
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Linguagem simples e direta
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-patient-border">
              Começar
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>

          <Link
            href="/chat?profile=professional"
            className="group flex flex-col rounded-2xl border-2 bg-professional-bg border-professional-border p-6 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-card text-professional-border shadow-sm">
              <Stethoscope className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-professional-border">
              Profissional
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Linguagem técnica e protocolar
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-professional-border">
              Começar
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Este assistente fornece orientações de apoio com base na documentação
          oficial da UDI/HC-UFPE e não substitui a orientação da equipe de saúde.
        </p>
      </div>
    </main>
  )
}
