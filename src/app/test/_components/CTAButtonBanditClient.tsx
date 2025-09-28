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
  labels?: Partial<Record<"A"|"B"|"control", string>>;
  href?: string;
  onClick?: () => void; // si el padre es Client, podrá pasar una función
};

type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };

export default function CTAButtonClient({
  initialVariant, persistCookieKey, shouldPersist, slug, className = "", labels, href, onClick
}: Props) {
  const router = useRouter();
  const [variant] = React.useState<"A" | "B">(initialVariant);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const startedRef = React.useRef<boolean>(false); // ✅ tipado explícito

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
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant }),
        });
        // ✅ evitar any del json()
        const json = (await res.json()) as unknown as StartVisitResponse;
        if (!aborted && json?.visit_id) setVisitId(json.visit_id);
      } catch {}
    })();

    return () => { aborted = true; };
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
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visit_id: visitId, type: "cta_click" }),
        }).catch(() => {});
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