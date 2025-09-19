"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ----- Estilos base (coinciden con lo que ya usamos) ----- */
const btnBlack =
  "rounded-lg bg-black text-white px-4 py-3 text-base sm:text-sm font-semibold shadow-sm transition " +
  "hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const btnGhost =
  "rounded-lg border border-gray-300 px-4 py-3 text-base sm:text-sm font-semibold text-gray-900 shadow-sm transition " +
  "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

type ScoreContext = {
  total?: number; // 0..40 (para 10 ítems)
  avg?: number;   // 0..4
  n?: number;     // ej: 10
  probabilityLabel?: string; // texto como “Probabilidad alta”
};

export interface ThreeSessionEvaluationProps {
  price?: number;            // por defecto 150000
  locale?: string;           // por defecto "es-ES"
  currency?: "ARS" | "CLP" | "USD" | "EUR" | string; // si querés formato monetario real
  useCurrencyStyle?: boolean; // si true usa Intl con style:"currency"
  title?: string;
  description?: string;
  features?: string[];
  className?: string;
  onReserve: () => void;     // acción principal
  onDetails?: () => void;    // acción secundaria opcional
  scoreContext?: ScoreContext; // para mostrar sugerencia dinámica
}

/* Sugerencia dinámica según score total (0..40) */
function adviceFromTotal(total?: number) {
  if (typeof total !== "number") {
    return "Si estás evaluando tu atención y organización, una evaluación guiada puede ayudarte a clarificar el cuadro y definir próximos pasos.";
  }
  if (total >= 30) {
    return "Por tu probabilidad estimada (alta/muy alta), es recomendable avanzar con la evaluación completa para obtener un diagnóstico formal y un plan de intervención.";
  }
  if (total >= 20) {
    return "Dado el nivel moderado de probabilidad, una evaluación clínica puede ayudarte a clarificar el cuadro y prevenir impacto funcional.";
  }
  return "Si bien la probabilidad es baja, considera la evaluación si existen dificultades persistentes en estudio, trabajo o relaciones.";
}

/* Formato de precio flexible */
function formatPrice(
  value: number,
  { locale = "es-ES", currency, useCurrencyStyle }: { locale?: string; currency?: string; useCurrencyStyle?: boolean }
) {
  try {
    if (useCurrencyStyle && currency) {
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    }
    // Formato simple con separadores y símbolo $
    return `$${new Intl.NumberFormat(locale).format(value)}`;
  } catch {
    return `$${value}`;
  }
}

export default function ThreeSessionEvaluation({
  price = 150_000,
  locale = "es-ES",
  currency, // opcional
  useCurrencyStyle = false,
  title = "Evaluación de 3 sesiones",
  description = "Proceso estructurado en 3 encuentros para confirmar diagnóstico, identificar factores asociados y definir un plan de acción.",
  features = [
    "Tres sesiones clínicas (1:1)",
    "Informe de devolución y recomendaciones",
    "Orientación de siguientes pasos"
  ],
  className,
  onReserve,
  onDetails,
  scoreContext,
}: ThreeSessionEvaluationProps) {
  const priceText = formatPrice(price, { locale, currency, useCurrencyStyle });
  const advisory = adviceFromTotal(scoreContext?.total);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={["rounded-2xl border border-gray-200 bg-gray-50 p-5 md:p-6", className].filter(Boolean).join(" ")}
      aria-label="Evaluación de 3 sesiones"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Texto */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
          {features?.length ? (
            <ul className="mt-2 grid gap-1 text-sm text-gray-700">
              {features.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Precio + CTAs */}
        <div className="shrink-0">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{priceText}</div>
            <div className="text-xs text-gray-500">precio total del paquete</div>
          </div>
          <div className="mt-3 flex items-center gap-2 md:justify-end">
            <button onClick={onReserve} className={btnBlack}>
              Reservar evaluación
            </button>
            {onDetails ? (
              <button onClick={onDetails} className={btnGhost}>
                Conocer más
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sugerencia dinámica */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
        {advisory}
      </div>

      {/* Pie contextual (opcional) */}
      {scoreContext ? (
        <div className="mt-3 text-xs text-gray-500">
          {typeof scoreContext.total === "number" && typeof scoreContext.n === "number" ? (
            <span>
              Resultado: total {scoreContext.total} / {scoreContext.n * 4}
              {typeof scoreContext.avg === "number" ? ` · promedio ${scoreContext.avg.toFixed(2)}/4` : null}
              {scoreContext.probabilityLabel ? ` · ${scoreContext.probabilityLabel}` : null}
            </span>
          ) : scoreContext.probabilityLabel ? (
            <span>{scoreContext.probabilityLabel}</span>
          ) : null}
        </div>
      ) : null}
    </motion.section>
  );
}