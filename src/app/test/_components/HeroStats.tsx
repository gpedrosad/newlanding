"use client";

import * as React from "react";

type StatItem = {
  /** Lo de arriba (número, símbolo, texto corto) */
  value: React.ReactNode;
  /** Etiqueta pequeña debajo */
  label: string;
};

type Props = {
  /** Tarjetas a mostrar (por defecto las 3 del ejemplo) */
  items?: StatItem[];
  /** Nota al pie */
  note?: string;
  /** Clases extra para el contenedor externo */
  className?: string;
};

export default function HeroStats({
  items = [
    { value: "4–6", label: "minutos" },
    { value: "100%", label: "online" },
    { value: "✓", label: "orientativo" },
  ],
  note = "Este test no reemplaza una evaluación clínica completa.",
  className = "",
}: Props) {
  const cols =
    items.length === 2
      ? "grid-cols-2"
      : items.length === 4
      ? "grid-cols-4"
      : "grid-cols-3";

  return (
    <div className={`order-first -mx-2 md:order-none md:mx-0 ${className}`}>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className={`grid ${cols} gap-3 text-center`}>
          {items.map((it, idx) => (
            <div key={idx} className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-semibold text-gray-900">{it.value}</p>
              <p className="text-xs text-gray-500">{it.label}</p>
            </div>
          ))}
        </div>
      </div>
      {note && (
        <p className="mt-3 text-center text-xs text-gray-500">
          {note}
        </p>
      )}
    </div>
  );
}