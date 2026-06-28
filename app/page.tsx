import Link from "next/link"
import { Stethoscope, User, ArrowRight, ShieldCheck } from "lucide-react"

const SAMPLE_CODES = ["TC", "RM", "USG", "MMG", "RX"]

export default function HomePage() {
  return (
    <main className="relative min-h-svh overflow-hidden">
      {/* Ambient light-box wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60svh] bg-gradient-to-b from-mist/70 to-transparent"
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
        {/* Brand line */}
        <div className="flex items-center gap-2.5 text-azure-deep">
          <ShieldCheck className="size-4" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
            HC-UFPE · Diagnóstico por Imagem
          </span>
        </div>

        {/* Hero */}
        <header className="mt-16 max-w-3xl sm:mt-24">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-steel">
            Assistente de preparo
          </p>
          <h1 className="mt-4 font-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
            Saiba exatamente como{" "}
            <em className="font-medium italic text-azure-deep">se preparar</em>{" "}
            para o seu exame de imagem.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-steel sm:text-lg">
            Orientações de jejum, contraste, documentos e agendamento — com base
            na documentação oficial da UDI. Escolha seu perfil para começar.
          </p>
        </header>

        {/* Profile cards */}
        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2">
          <ProfileCard
            href="/chat?profile=patient"
            icon={User}
            kicker="01 · Para você"
            title="Paciente"
            desc="Linguagem simples e acolhedora, passo a passo."
          />
          <ProfileCard
            href="/chat?profile=professional"
            icon={Stethoscope}
            kicker="02 · Equipe de saúde"
            title="Profissional"
            desc="Protocolos, contraindicações e fluxo operacional."
          />
        </div>

        {/* Footer — exam-code texture as the signature material */}
        <div className="mt-auto pt-14">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
              Modalidades
            </span>
            {SAMPLE_CODES.map((c) => (
              <span
                key={c}
                className="rounded-md bg-mist px-2 py-0.5 font-mono text-[11px] font-medium text-azure-deep"
              >
                {c}
              </span>
            ))}
            <p className="mt-1 w-full max-w-2xl text-xs leading-relaxed text-steel sm:mt-2">
              Este assistente fornece orientações de apoio e não substitui a
              orientação da equipe de saúde.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function ProfileCard({
  href,
  icon: Icon,
  kicker,
  title,
  desc,
}: {
  href: string
  icon: typeof User
  kicker: string
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:-translate-y-1 hover:border-azure hover:shadow-[0_12px_40px_-12px_oklch(0.58_0.18_256_/_0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
        {kicker}
      </span>
      <div className="mt-5 flex size-12 items-center justify-center rounded-xl bg-mist text-azure">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-serif text-2xl text-ink">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-steel">{desc}</p>
      <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-azure">
        Começar
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
