"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/* =================== Config (10 ítems) =================== */
const QUESTIONS: string[] = [
  "Me resulta difícil concentrarme en tareas largas.",
  "Me distraigo con facilidad por estímulos externos.",
  "Me cuesta organizarme o terminar lo que empiezo.",
  "Evito tareas que requieren esfuerzo mental sostenido.",
  "Pierdo cosas necesarias para mis actividades (llaves, documentos, citas).",
  "Me cuesta quedarme quieto/a o siento inquietud interna.",
  "Interrumpo a otros o respondo antes de que terminen de hablar.",
  "Actúo de manera impulsiva (compro, decido o hablo sin pensar lo suficiente).",
  "Me cuesta empezar tareas aunque sé que son importantes.",
  "Tengo dificultad para gestionar el tiempo y cumplir plazos.",
];

const OPTIONS = [
  { label: "Nunca", value: 0 },
  { label: "Rara vez", value: 1 },
  { label: "A veces", value: 2 },
  { label: "A menudo", value: 3 },
  { label: "Muy a menudo", value: 4 },
] as const;

/* =================== Estilos =================== */
const btnBlack =
  "rounded-lg bg-black text-white px-4 py-3 text-base sm:text-sm font-semibold shadow-sm transition active:scale-[0.99] " +
  "hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

const optBase =
  "rounded-xl border px-4 py-3 text-base sm:text-sm md:text-sm font-medium transition select-none touch-manipulation min-h-[48px] md:min-h-[44px] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60";
const optIdle = "border-gray-300 text-gray-900 hover:bg-gray-50 md:hover:bg-gray-100 active:bg-gray-100";
const optActive = "border-black bg-black text-white shadow-sm";

/* =================== Page =================== */
export default function Page() {
  const router = useRouter();

  type Answer = number | null;
  type Dir = 1 | -1;

  const [answers, setAnswers] = useState<Answer[]>(Array(QUESTIONS.length).fill(null));
  const [idx, setIdx] = useState<number>(0);
  const [dir, setDir] = useState<Dir>(1);
  const [lock, setLock] = useState<boolean>(false); // evita doble avance

  // Refs con estado actual para usar en listeners estables
  const idxRef = useRef(idx);
  const answersRef = useRef(answers);
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const answeredCount = useMemo(
    () => answers.filter((v): v is number => v !== null).length,
    [answers]
  );

  function goToResult(finalAnswers: Answer[]): void {
    const n = QUESTIONS.length;               // 10
    const filled = finalAnswers.map(v => (v ?? 0));
    const total = filled.reduce((a, b) => a + b, 0); // 0..40
    const avg = total / n;                           // 0..4
    const avg2 = Math.round(avg * 100) / 100;

    const params = new URLSearchParams({
      total: String(total),
      avg: String(avg2),
      n: String(n),
      score: String(avg2), // compat
    });
    router.push(`/test/tdah/resultado?${params.toString()}`);
  }

  // Avanza con bloqueo temporal para evitar “doble click/keydown”
  function safeAdvance(next: () => void) {
    if (lock) return;
    setLock(true);
    next();
    // Duración ligeramente > a la animación (0.22s) para prevenir dobles
    window.setTimeout(() => setLock(false), 260);
  }

  function handleSelect(value: number): void {
    if (lock) return;
    const qIndex = idxRef.current;
    const current = [...answersRef.current];
    current[qIndex] = value;
    setAnswers(current);

    safeAdvance(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setDir(1);
        setIdx(qIndex + 1);
      } else {
        goToResult(current);
      }
    });
  }

  function handlePrev(): void {
    if (idxRef.current === 0 || lock) return;
    safeAdvance(() => {
      setDir(-1);
      setIdx((i) => Math.max(0, i - 1));
    });
  }

  // Atajos de teclado: listener único, usa refs actuales
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const curIdx = idxRef.current;
      const curAnswers = answersRef.current;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (curAnswers[curIdx] !== null) {
          safeAdvance(() => {
            if (curIdx < QUESTIONS.length - 1) {
              setDir(1);
              setIdx(curIdx + 1);
            } else {
              goToResult(curAnswers);
            }
          });
        }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        handleSelect(OPTIONS[n - 1].value);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // deps vacías: se registra una sola vez
  }, []);

  const qText: string = QUESTIONS[idx];
  const selected: number | null = answers[idx];

  return (
    <div className="min-h-svh w-full bg-white [--tap-highlight-color:_transparent]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-semibold text-gray-900">TDAH · Adultos</span>
          </div>
          <Progress steps={QUESTIONS.length} current={idx} />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:pb-10 md:px-6 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-10"
        >
          {/* Section header */}
          <div className="mb-6 flex items-start justify-between md:mb-8">
            <div className="space-y-0.5">
              <p className="text-xs text-gray-500">Pregunta {idx + 1} de {QUESTIONS.length}</p>
              <h1 className="text-base font-semibold text-gray-900 sm:text-lg md:text-2xl md:leading-tight">
                Selecciona la opción que mejor te represente
              </h1>
            </div>
            <span className="ml-4 shrink-0 text-xs text-gray-500 md:text-sm">
              {answeredCount}/{QUESTIONS.length}
            </span>
          </div>

          {/* Question block */}
          <div className="grid gap-6 md:gap-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.fieldset
                key={idx}
                initial={{ opacity: 0, x: (dir as number) * 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -(dir as number) * 48 }}
                transition={{ duration: 0.22 }}
                className="grid gap-4 md:gap-5"
              >
                <legend id="questionLabel" className="text-lg font-medium text-gray-900 sm:text-xl md:text-[22px]">
                  {idx + 1}. {qText}
                </legend>

                <div
                  role="radiogroup"
                  aria-labelledby="questionLabel"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-5 md:gap-3"
                >
                  {OPTIONS.map((opt) => {
                    const active = selected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={[optBase, active ? optActive : optIdle, "cursor-pointer"].join(" ")}
                        aria-pressed={active}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <p className="hidden select-none text-xs text-gray-500 md:block">
                  Atajos: 1–5 para elegir, ← para volver y → para avanzar.
                </p>
              </motion.fieldset>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Bottom action bar (Back only) */}
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/70 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:static sm:pb-0 md:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button type="button" onClick={handlePrev} disabled={idx === 0} className={btnBlack}>
            ← Atrás
          </button>
          <div className="hidden sm:block text-xs text-gray-500">Paso {idx + 1} de {QUESTIONS.length}</div>
        </div>
      </footer>
    </div>
  );
}

/* =================== UI helpers =================== */
function Progress({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5" aria-label="Progreso">
      {Array.from({ length: steps }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-6 sm:w-8 md:w-10 rounded ${i <= current ? "bg-black" : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}