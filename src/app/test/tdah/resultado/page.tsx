"use client";

import React, { useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ThreeSessionEvaluation from "@/app/components/ThreeSessionEvaluation";
import StickyHeader from "./_components/StickyHeader";
import ScoreCard from "./_components/ScoreCard";

/* ===========================
   Página con Suspense wrapper
   =========================== */
export default function ResultPage() {
  return (
    <Suspense fallback={<ResultFallback />}>
      <ResultInner />
    </Suspense>
  );
}

/* ================
   Skeleton fallback
   ================ */
function ResultFallback() {
  return (
    <div className="min-h-svh w-full bg-white">
      <StickyHeader
        title="TDAH · Resultado"
        right={<span className="h-3 w-24 animate-pulse rounded bg-gray-200 inline-block" />}
      />
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-2 w-1/3 animate-pulse rounded-full bg-gray-300" />
              </div>
              <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-24 w-full animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =================
   Utils y constantes
   ================= */
function rangeLabel(total: number) {
  if (total >= 35) return { label: "Muy alto", badge: "bg-black text-white" };
  if (total >= 30) return { label: "Alto", badge: "bg-gray-900 text-white" };
  if (total >= 20) return { label: "Medio", badge: "bg-gray-700 text-white" };
  if (total >= 10) return { label: "Bajo", badge: "bg-gray-500 text-white" };
  return { label: "Muy bajo", badge: "bg-gray-300 text-gray-900" };
}

/** Mapea el total (0–40) a una categoría de probabilidad de diagnóstico + texto guía */
function probabilityCategory(total: number) {
  if (total >= 35) {
    return {
      label: "Probabilidad muy alta",
      badge: "bg-black text-white",
      text:
        "Tu patrón de respuestas sugiere una probabilidad muy alta de un cuadro compatible con TDAH. " +
        "Es muy recomendable realizar una evaluación clínica completa para confirmar el diagnóstico, " +
        "explorar condiciones asociadas y diseñar un plan de tratamiento."
    };
  }
  if (total >= 30) {
    return {
      label: "Probabilidad alta",
      badge: "bg-gray-900 text-white",
      text:
        "Existe una probabilidad alta de TDAH. Te conviene agendar una evaluación integral para precisar el diagnóstico " +
        "y definir estrategias de intervención personalizadas."
    };
  }
  if (total >= 20) {
    return {
      label: "Probabilidad moderada",
      badge: "bg-gray-700 text-white",
      text:
        "Tus respuestas indican probabilidad moderada. Puede haber manifestaciones de inatención y/o impulsividad. " +
        "Una evaluación clínica ayudará a aclarar el cuadro y a priorizar medidas prácticas."
    };
  }
  if (total >= 10) {
    return {
      label: "Probabilidad baja",
      badge: "bg-gray-500 text-white",
      text:
        "La probabilidad estimada es baja. Aun así, si notas impacto en estudio, trabajo o relaciones, " +
        "una consulta profesional puede orientar estrategias de manejo."
    };
  }
  return {
    label: "Probabilidad muy baja",
    badge: "bg-gray-300 text-gray-900",
    text:
      "La probabilidad estimada es muy baja. Si persisten dudas o hay dificultades significativas, " +
      "una evaluación clínica puede descartar otras causas y brindar recomendaciones."
  };
}

const btnBlack =
  "rounded-lg bg-black text-white px-4 py-3 text-base sm:text-sm font-semibold shadow-sm transition " +
  "hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

/* ==========================
   Contenido real de la página
   ========================== */
function ResultInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const n = useMemo(() => {
    const v = Number(sp.get("n"));
    return Number.isFinite(v) && v > 0 ? v : 0; // esperado: 10
  }, [sp]);

  // Parser flexible: acepta total/avg/score
  const parsed = useMemo(() => {
    const totalParam = Number(sp.get("total"));
    const avgParam = Number(sp.get("avg"));
    const scoreParam = Number(sp.get("score"));

    let total: number | null = Number.isFinite(totalParam) ? totalParam : null;
    let avg: number | null = Number.isFinite(avgParam) ? avgParam : null;

    if ((total == null || !Number.isFinite(total)) && Number.isFinite(scoreParam)) {
      if (scoreParam > 4.000001) total = scoreParam;
      else avg = scoreParam;
    }

    if ((avg == null || !Number.isFinite(avg)) && total != null && n > 0) {
      avg = total / n;
    }
    if ((total == null || !Number.isFinite(total)) && avg != null && n > 0) {
      total = avg * n;
    }

    if (avg == null || total == null || !Number.isFinite(avg) || !Number.isFinite(total) || n === 0) {
      return null;
    }

    const cappedAvg = Math.max(0, Math.min(4, avg));
    const cappedTotal = Math.max(0, Math.min(n * 4, total));
    const pct = Math.round((cappedTotal / (n * 4)) * 100);

    return { avg: cappedAvg, total: cappedTotal, pct };
  }, [sp, n]);

  function handleRetake() {
    router.replace("/test/tdah");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Resultado TDAH", text: "Mi resultado del test.", url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado");
      } catch {
        alert("No se pudo copiar el enlace.");
      }
    }
  }

  if (!parsed) {
    return (
      <div className="min-h-svh w-full bg-white">
        <StickyHeader title="TDAH · Resultado" />
        <main className="mx-auto max-w-screen-sm px-4 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900">No hay datos para mostrar</h1>
            <p className="mt-2 text-sm text-gray-600">Vuelve al test y completa las preguntas.</p>
            <div className="mt-6">
              <button onClick={handleRetake} className={btnBlack}>Rehacer test</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { avg, total, pct } = parsed;
  const band = rangeLabel(total);
  const prob = probabilityCategory(total);

  // ---- Handlers para el componente de Evaluación ----
  const PRICE = 150_000;

  const handleReserve = () => {
    const qp = new URLSearchParams({
      plan: "evaluacion-3-sesiones",
      precio: String(PRICE),
      total: total.toFixed(0),
      avg: avg.toFixed(2),
      n: String(n),
      prob: prob.label,
    }).toString();
    router.push(`/agenda?${qp}`); // ajusta a tu ruta real
  };

  const handleDetails = () => {
    router.push("/servicios/evaluacion"); // ajusta a tu ruta real
  };

  return (
    <div className="min-h-svh w-full bg-white">
      <StickyHeader title="TDAH · Resultado" right={`Ítems: ${n}`} />

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-10"
        >
          {/* Resumen superior usando ScoreCard */}
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <ScoreCard
              title={`Puntaje total (0–${n * 4})`}
              value={total.toFixed(0)}
              suffix={` / ${n * 4}`}
              progressPct={pct}
              progressLabel={`${pct}% del máximo posible`}
            />

            <ScoreCard
              title="Promedio (0–4) y referencia"
              value={avg.toFixed(2)}
              suffix=" / 4"
              badgeText={band.label}
              badgeClass={band.badge}
            >
              {/* Guía debajo del segundo card */}
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                <div className="mb-1 text-xs font-semibold text-gray-900">Guía de interpretación (total 0–40):</div>
                <ul className="grid gap-1">
                  <li>0–9: Muy bajo</li>
                  <li>10–19: Bajo</li>
                  <li>20–29: Medio</li>
                  <li>30–34: Alto</li>
                  <li>35–40: Muy alto</li>
                </ul>
              </div>
            </ScoreCard>
          </div>

          {/* Probabilidad de diagnóstico */}
          <section className="mt-8 grid gap-3">
            <h3 className="text-base font-semibold text-gray-900">Probabilidad de diagnóstico</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${prob.badge}`}>
                {prob.label}
              </span>
              <span className="text-sm text-gray-500">
                Estimación basada en tus respuestas (no constituye diagnóstico)
              </span>
            </div>
            <p className="text-sm text-gray-700">{prob.text}</p>
          </section>

          {/* Evaluación 3 sesiones */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-200">
            <ThreeSessionEvaluation
              price={PRICE}
              onReserve={handleReserve}
              onDetails={handleDetails}
              scoreContext={{
                total,
                avg,
                n,
                probabilityLabel: prob.label,
              }}
            />
          </div>

          {/* Acciones base */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={handleRetake} className={btnBlack}>Rehacer test</button>
            <button onClick={handleShare} className={btnBlack}>Compartir resultado</button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}