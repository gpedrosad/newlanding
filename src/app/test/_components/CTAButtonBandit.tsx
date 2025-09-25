// src/components/CTAButtonBandit.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type GetVariantResponse = { variant: string; anon_id?: string; disabled?: boolean };
type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };

type Base = "A" | "B" | "control";

type Props = {
  /** Slug del experimento en tu DB (debería tener variantes A y B) */
  slug?: string; // default: "cta-copy"
  /** Acción a ejecutar después del log (opcional) */
  onClick?: () => void;
  /** Navegación opcional si no pasas onClick */
  href?: string;
  /** Clases extra para el botón */
  className?: string;
  /** Etiquetas personalizadas por variante (opcional) */
  labels?: Partial<Record<Base, string>>;
  /** Deshabilitar mientras carga la variante (default: true) */
  disableWhileLoading?: boolean;
};

function normalizeBase(raw: string | null): Base {
  if (!raw) return "control";
  const s = raw.trim().toLowerCase();
  if (s.startsWith("a")) return "A";
  if (s.startsWith("b")) return "B";
  return "control";
}

export default function CTAButtonBandit({
  slug = "cta-copy",
  onClick,
  href,
  className = "",
  labels,
  disableWhileLoading = true,
}: Props) {
  const router = useRouter();

  const [rawVariant, setRawVariant] = React.useState<string | null>(null);
  const [anon, setAnon] = React.useState<string | null>(null);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const startedRef = React.useRef(false);

  const base: Base = React.useMemo(() => normalizeBase(rawVariant), [rawVariant]);

  // Etiquetas por defecto
  const textByVariant: Record<Base, string> = {
    A: "Comenzar evaluación",
    B: "Hacer test ahora",
    control: "Empezar ahora",
  };
  const label = (labels && labels[base]) || textByVariant[base];

  // 1) Obtener variante
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/get-variant`, {
          cache: "no-store",
        });
        const d: GetVariantResponse = await res.json();
        if (!mounted) return;
        setRawVariant(d.variant);     // p.ej. "A", "B" (o "control")
        setAnon(d.anon_id ?? null);
      } catch {
        if (mounted) setRawVariant("control");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // 2) Iniciar visita (contabiliza impresión del CTA para este experimento)
  React.useEffect(() => {
    if (!rawVariant || startedRef.current) return;
    startedRef.current = true;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant: rawVariant }), // guardamos la variante cruda
        });
        const json: StartVisitResponse = await res.json();
        if (!aborted && json?.visit_id) setVisitId(json.visit_id);
      } catch {
        // noop
      }
    })();

    return () => {
      aborted = true;
    };
  }, [rawVariant, slug]);

  // 3) Click (goal)
  const handleClick = async () => {
    try {
      setLoading(true);

      // log de click para este experimento (idempotente por visita)
      if (visitId) {
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visit_id: visitId, type: "cta_click" }),
        }).catch(() => {});
      }

      // opcional: marcar conversión por anon_id (si usas ese flujo)
      if (anon) {
        fetch(`/api/experiment/${encodeURIComponent(slug)}/convert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anon_id: anon }),
        }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }

    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const isResolving = rawVariant === null;
  const disabled = (disableWhileLoading && isResolving) || loading;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      data-exp={slug}
      data-variant={base}
      className={
        "inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-50 " +
        className
      }
      aria-label={label}
    >
      {isResolving ? "…" : loading ? "Cargando…" : label}
    </button>
  );
}