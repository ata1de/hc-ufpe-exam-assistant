"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  X,
  ScanLine,
  Brain,
  Waves,
  Radiation,
  Bone,
  Activity,
  Stethoscope,
  ChevronRight,
} from "lucide-react"
import {
  getModalidades,
  getExamsForModalidade,
  modalidadeLabel,
  type ExamOption,
} from "@/lib/exam-options"
import { cn } from "@/lib/utils"

const MODALIDADE_ICONS: Record<string, typeof ScanLine> = {
  tomografia_computadorizada: ScanLine,
  ressonancia_magnetica: Brain,
  ultrassonografia: Waves,
  radiologia_convencional: Radiation,
  mamografia: Activity,
  densitometria_ossea: Bone,
  medicina_nuclear: Stethoscope,
}

type Step = "modality" | "exam"

const CHIP_CLASS =
  "flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-azure hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure/40"

export function GuidedExamPicker({
  onSubmit,
  onClose,
}: {
  onSubmit: (query: string) => void
  onClose?: () => void
}) {
  const [step, setStep] = useState<Step>("modality")
  const [modalidade, setModalidade] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move o foco para o título a cada troca de passo (acessibilidade).
  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const modalidades = getModalidades()
  const exams = modalidade ? getExamsForModalidade(modalidade) : []

  function handleModalidade(m: string, singleQuery?: string) {
    if (singleQuery) {
      onSubmit(singleQuery)
      return
    }
    setModalidade(m)
    setStep("exam")
  }

  return (
    <div className="mt-4 w-full rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="font-serif text-base text-ink outline-none"
        >
          {step === "modality"
            ? "Que tipo de exame você vai fazer?"
            : `Qual exame? (${modalidadeLabel(modalidade!)})`}
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar perguntas guiadas"
            className="shrink-0 rounded-lg p-1 text-steel transition-colors hover:bg-mist hover:text-azure-deep"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <p className="mt-1 text-xs leading-relaxed text-steel">
        {step === "modality"
          ? "Não precisa saber o nome exato. Escolha a opção que combina com o seu pedido médico."
          : "Escolha o exame pelo nome do dia a dia."}
      </p>

      {step === "modality" && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {modalidades.map((m) => {
            const Icon = MODALIDADE_ICONS[m.modalidade] ?? Stethoscope
            const single = m.singleExam
            return (
              <button
                key={m.modalidade}
                type="button"
                onClick={() => handleModalidade(m.modalidade, single?.query)}
                className={CHIP_CLASS}
              >
                <Icon className="size-5 shrink-0 text-azure" aria-hidden="true" />
                <span className="flex-1">
                  {single ? single.label : m.label}
                </span>
                {!single && (
                  <ChevronRight
                    className="size-4 shrink-0 text-steel"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {step === "exam" && (
        <>
          <div className="mt-4 grid gap-2.5">
            {exams.map((ex) => (
              <ExamChip key={ex.sigla} exam={ex} onClick={() => onSubmit(ex.query)} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep("modality")}
            aria-label="Voltar para os tipos de exame"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-azure transition-colors hover:text-azure-deep"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar
          </button>
        </>
      )}
    </div>
  )
}

function ExamChip({
  exam,
  onClick,
}: {
  exam: ExamOption
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(CHIP_CLASS, "justify-between")}
    >
      <span className="flex-1">{exam.label}</span>
    </button>
  )
}
