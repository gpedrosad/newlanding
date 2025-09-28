// src/components/CTAButtonClient.tsx  (CLIENT)
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialVariant: "A" | "B";
  persistCookieKey: string;
  shouldPersist: boolean;
  slug: string;
  className?: string;
  labels?: Partial<Record<"A" | "B" | "control", string>>;
  href?: string;
  onClick?: () => void;
};

type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };

function isStartVisitResponse(x: unknown): x is StartVisitResponse {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  const ok = typeof o.ok === "boolean";
  const visitOk = o.visit_id === undefined || typeof o.visit_id === "string";
  const errOk = o.error === undefined || typeof o.error === "string";
  return ok && visitOk && errOk;
}

export default function CTAButtonClient({
  initialVariant,
  persistCookieKey,
  shouldPersist,
  slug,
  className = "",
  labels,
  href,
  onClick,
}: Props) {
  const router = useRouter();
  const [variant] = React.useState<"A" | "B">(initialVariant);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const startedRef = React.useRef<boolean>(false);

  // Persistir cookie de variante si no existía
  React.useEffect(() => {
    if (!shouldPersist) return;
    const maxAge = 60 * 60 * 24 * 30;
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${persistCookieKey}=${variant}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }, [shouldPersist, persistCookieKey, variant]);

  // Impresión del CTA (start)
  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/experiment/${encodeURIComponent(slug)}/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variant }),
          }
        );

        const raw: unknown = await res.json(); // ✅ sin any
        if (!aborted && isStartVisitResponse(raw) && raw.visit_id) {
          setVisitId(raw.visit_id);
        }
      } catch {
        /* no-op */
      }
    })();

    return () => {
      aborted = true;
    };
  }, [slug, variant]);

  const textByVariant = {
    A: "Comenzar evaluación",
    B: "Hacer test ahora",
    control: "Empezar ahora",
  } as const;

  const label = labels?.[variant] ?? textByVariant[variant];

  const handleClick = async () => {
    try {
      setLoading(true);
      if (visitId) {
        // No esperamos la respuesta; evitamos bloquear UI
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visit_id: visitId, type: "cta_click" }),
        }).catch(() => {
          /* no-op */
        });
      }
    } finally {
      setLoading(false);
    }

    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      data-exp={slug}
      data-variant={variant}
      className={
        "inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-50 " +
        className
      }
      aria-label={label}
    >
      {loading ? "Cargando…" : label}
    </button>
  );
}