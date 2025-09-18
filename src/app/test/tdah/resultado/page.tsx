"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

/* Rango de referencia para 10 ítems (máximo 40).
   Puedes ajustar los tramos si lo deseas. */
function rangeLabel(total: number) {
  if (total >= 35) return { label: "Muy alto", badge: "bg-black text-white" };
  if (total >= 30) return { label: "Alto", badge: "bg-gray-900 text-white" };
  if (total >= 20) return { label: "Medio", badge: "bg-gray-700 text-white" };
  if (total >= 10) return { label: "Bajo", badge: "bg-gray-500 text-white" };
  return { label: "Muy bajo", badge: "bg-gray-300 text-gray-900" };
}

const btnBlack =
  "rounded-lg bg-black text-white px-4 py-3 text-base sm:text-sm font-semibold shadow-sm transition " +
  "hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

export default function ResultPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const n = useMemo(() => {
    const v = Number(sp.get("n"));
    return Number.isFinite(v) && v > 0 ? v : 0; // debería ser 10
  }, [sp]);

  // Parser flexible: acepta total/avg/score
  const parsed = useMemo(() => {
    const totalParam = Number(sp.get("total"));
    const avgParam = Number(sp.get("avg"));
    const scoreParam = Number(sp.get("score"));

    let total: number | null = Number.isFinite(totalParam) ? totalParam : null;
    let avg: number | null = Number.isFinite(avgParam) ? avgParam : null;

    // Si llega solo "score", interpretamos: <=4 como promedio; >4 como total.
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

    // Capamos a los límites esperados
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
      try { await navigator.share({ title: "Resultado TDAH", text: "Mi resultado del test.", url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); alert("Enlace copiado"); } catch { alert("No se pudo copiar el enlace."); }
    }
  }

  if (!parsed) {
    return (
      <div className="min-h-svh w-full bg-white">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-screen-sm items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-black" />
              <span className="text-sm font-semibold text-gray-900">TDAH · Resultado</span>
            </div>
          </div>
        </header>
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

  return (
    <div className="min-h-svh w-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-semibold text-gray-900">TDAH · Resultado</span>
          </div>
          <span className="text-xs text-gray-500">Ítems: {n}</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:p-10"
        >
          {/* Resumen superior */}
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            {/* Total */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Puntaje total (0–{n * 4})</h2>
              <div className="text-4xl font-bold tracking-tight text-gray-900">
                {total.toFixed(0)} <span className="text-gray-400 text-2xl align-top">/ {n * 4}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-2 rounded-full bg-black"
                  aria-label="Porcentaje"
                />
              </div>
              <div className="text-xs text-gray-500">{pct}% del máximo posible</div>
            </div>

            {/* Promedio + banda */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Promedio (0–4) y referencia</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-3xl font-bold text-gray-900">
                  {avg.toFixed(2)} <span className="text-gray-400 text-xl align-top">/ 4</span>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${band.badge}`}>
                  {band.label}
                </span>
              </div>
              {/* Tabla de referencia para 10 ítems */}
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                <div className="text-xs font-semibold text-gray-900 mb-1">Referencia (total 0–40):</div>
                <ul className="grid gap-1">
                  <li>0–9: Muy bajo</li>
                  <li>10–19: Bajo</li>
                  <li>20–29: Medio</li>
                  <li>30–34: Alto</li>
                  <li>35–40: Muy alto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={handleRetake} className={btnBlack}>Rehacer test</button>
            <button onClick={handleShare} className={btnBlack}>Compartir resultado</button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}