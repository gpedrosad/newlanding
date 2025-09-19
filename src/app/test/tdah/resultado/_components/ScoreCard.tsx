"use client";

import { motion } from "framer-motion";

export function TotalScoreCard({ total, max, pct }:{ total:number; max:number; pct:number }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Puntaje total (0–{max})</h2>
      <div className="text-4xl font-bold tracking-tight text-gray-900">
        {total.toFixed(0)} <span className="text-gray-400 text-2xl align-top">/ {max}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-2 rounded-full bg-black" />
      </div>
      <div className="text-xs text-gray-500">{pct}% del máximo posible</div>
    </div>
  );
}

export function AvgCard({ avg, badge, label }:{ avg:number; badge:string; label:string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">Promedio (0–4) y referencia</h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-3xl font-bold text-gray-900">
          {avg.toFixed(2)} <span className="text-gray-400 text-xl align-top">/ 4</span>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${badge}`}>{label}</span>
      </div>
      <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
        <div className="mb-1 text-xs font-semibold text-gray-900">Guía (total 0–40):</div>
        <ul className="grid gap-1">
          <li>0–9: Muy bajo</li><li>10–19: Bajo</li><li>20–29: Medio</li><li>30–34: Alto</li><li>35–40: Muy alto</li>
        </ul>
      </div>
    </div>
  );
}

export function ProbabilitySection({ badge, label, text }:{ badge:string; label:string; text:string }) {
  return (
    <section className="mt-8 grid gap-3">
      <h3 className="text-base font-semibold text-gray-900">Probabilidad de diagnóstico</h3>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${badge}`}>{label}</span>
        <span className="text-sm text-gray-500">Estimación basada en tus respuestas (no constituye diagnóstico)</span>
      </div>
      <p className="text-sm text-gray-700">{text}</p>
    </section>
  );
}

interface ScoreCardProps {
  title: string;
  value: string;
  suffix?: string;
  progressPct?: number;
  progressLabel?: string;
  badgeText?: string;
  badgeClass?: string;
  children?: React.ReactNode;
}

export default function ScoreCard({ 
  title, 
  value, 
  suffix, 
  progressPct, 
  progressLabel, 
  badgeText, 
  badgeClass, 
  children 
}: ScoreCardProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-3xl font-bold text-gray-900">
          {value} {suffix && <span className="text-gray-400 text-xl align-top">{suffix}</span>}
        </div>
        {badgeText && badgeClass && (
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${badgeClass}`}>
            {badgeText}
          </span>
        )}
      </div>
      {progressPct !== undefined && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progressPct}%` }} 
            transition={{ duration: 0.5 }} 
            className="h-2 rounded-full bg-black" 
          />
        </div>
      )}
      {progressLabel && (
        <div className="text-xs text-gray-500">{progressLabel}</div>
      )}
      {children}
    </div>
  );
}