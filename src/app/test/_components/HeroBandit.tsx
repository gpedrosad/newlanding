"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Shield, Clock } from "lucide-react";

type Variant = "A" | "B" | "control";
type GetVariantResponse = { variant: Variant; anon_id?: string; disabled?: boolean };
type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };

type Props = { slug?: string; onPrimary?: () => void; className?: string };

declare global { interface Window { __visit_id?: string } }

export default function HeroBandit({ slug = "hero-tdah", onPrimary, className = "" }: Props) {
  const router = useRouter();
  const [variant, setVariant] = React.useState<Variant | null>(null); // <- sin fallback visible
  const [anon, setAnon] = React.useState<string | null>(null);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Evita /start duplicado (StrictMode/effects)
  const startedRef = React.useRef(false);

  // ===== 1) Obtener variante (bandit) =====
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/get-variant`, { cache: "no-store" });
        const d: GetVariantResponse = await res.json();
        if (!mounted) return;
        setVariant(d.variant);           // ya no hay parpadeo de A->B
        setAnon(d.anon_id ?? null);
      } catch {
        // si falla, fija un control; pero seguimos evitando flash
        if (mounted) setVariant("control");
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // ===== 2) Iniciar visita (hero_view) → visitId (solo una vez) =====
  React.useEffect(() => {
    if (!variant || startedRef.current) return;
    startedRef.current = true;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant }),
        });
        const json: StartVisitResponse = await res.json();
        if (!aborted && json?.visit_id) {
          setVisitId(json.visit_id);
          window.__visit_id = json.visit_id;
        }
      } catch {
        // noop
      }
    })();

    return () => { aborted = true; };
  }, [variant, slug]);

  // ===== helper: cerrar visita (Time on Page total) =====
  const leave = React.useCallback(() => {
    if (!visitId) return;
    const url = `/api/experiment/${encodeURIComponent(slug)}/leave`;
    const payload = JSON.stringify({ visit_id: visitId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [visitId, slug]);

  // ===== helper: enviar tiempo activo =====
  const sendActive = React.useCallback((deltaSec: number) => {
    if (!visitId || deltaSec <= 0) return;
    const url = `/api/experiment/${encodeURIComponent(slug)}/active`;
    const payload = JSON.stringify({ visit_id: visitId, deltaSec });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [visitId, slug]);

  // ===== 3) Primer scroll (bounce) =====
  React.useEffect(() => {
    if (!visitId) return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      if (window.scrollY > 50) {
        fired = true;
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visit_id: visitId, type: "scroll_first" }),
        }).catch(() => {});
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visitId, slug]);

  // ===== 4) Form start (primer focus o keydown) =====
  React.useEffect(() => {
    if (!visitId) return;
    let fired = false;
    const handler = () => {
      if (fired) return;
      fired = true;
      fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visit_id: visitId, type: "form_start" }),
      }).catch(() => {});
      document.removeEventListener("focusin", handler);
      document.removeEventListener("keydown", handler);
    };
    document.addEventListener("focusin", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("focusin", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [visitId, slug]);

  // ===== 5) Heartbeat de TIEMPO ACTIVO =====
  React.useEffect(() => {
    if (!visitId) return;

    const lastActivityRef = { current: Date.now() };
    const markActivity = () => { lastActivityRef.current = Date.now(); };

    const isVisible = () => document.visibilityState === "visible";
    const isActive = () => Date.now() - lastActivityRef.current < 10_000; // idle si >10s sin actividad

    let hbTimer: number | null = null;
    const start = () => { if (hbTimer === null) hbTimer = window.setInterval(tick, 5000); };
    const stop  = () => { if (hbTimer !== null) { clearInterval(hbTimer); hbTimer = null; } };

    const tick = () => { if (isVisible() && isActive()) sendActive(5); };

    const onVis = () => { if (isVisible()) { markActivity(); start(); } else { stop(); } };

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove","scroll","keydown","touchstart","click"];
    activityEvents.forEach((ev) => window.addEventListener(ev, markActivity as EventListener, { passive: true }));
    document.addEventListener("visibilitychange", onVis);

    if (isVisible()) start();

    const onLeaveActive = () => { if (isVisible() && isActive()) sendActive(5); };
    window.addEventListener("pagehide", onLeaveActive);
    window.addEventListener("beforeunload", onLeaveActive);

    return () => {
      stop();
      activityEvents.forEach((ev) => window.removeEventListener(ev, markActivity as EventListener));
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onLeaveActive);
      window.removeEventListener("beforeunload", onLeaveActive);
    };
  }, [visitId, sendActive]);

  // ===== 6) Cerrar visita al salir/recargar (ToP) =====
  React.useEffect(() => {
    if (!visitId) return;
    const onLeave = () => leave();
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [visitId, leave]);

  // ===== 6b) Interceptar enlaces internos (SPA) =====
  React.useEffect(() => {
    if (!visitId) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      const isInternal = href && href.startsWith("/") && (!target || target === "_self");
      if (isInternal) leave();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [visitId, leave]);

  // ===== 7) CTA principal =====
  const handlePrimary = async () => {
    try {
      setLoading(true);
      if (visitId) {
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visit_id: visitId, type: "cta_click" }),
        }).catch(() => {});
      }
      if (anon) {
        await fetch(`/api/experiment/${encodeURIComponent(slug)}/convert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ anon_id: anon }),
        });
      }
    } finally {
      setLoading(false);
    }

    if (onPrimary) { onPrimary(); return; }

    const form = document.getElementById("form-start");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      leave();
      router.push("/test/tdah?step=1");
    }
  };

  // ===== UI =====
  // Skeleton mientras resolvemos la variante (evita "flip")
  if (!variant) {
    return (
      <section className={"relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm " + className}>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-7 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="mt-4 h-10 w-40 rounded-2xl bg-gray-300" />
            </div>
            <div className="h-40 rounded-2xl border border-gray-200 bg-white shadow-sm" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={"relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm " + className}>
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-black/5 blur-3xl" />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid items-center gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {variant === "A" && (<>
              <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                Test breve de TDAH, <span className="underline decoration-black/20">sin vueltas</span>
              </h1>
              <p className="text-gray-600">Screening inicial en 4–6 minutos. Obtén una indicación clara para decidir si vale la pena una evaluación completa.</p>
            </>)}
            {variant === "B" && (<>
              <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                ¿Dudas de TDAH? Empieza con un <span className="underline decoration-black/20">screening guiado</span>
              </h1>
              <p className="text-gray-600">Responde un cuestionario breve y recibe una orientación práctica para tu siguiente paso terapéutico.</p>
            </>)}
            {variant === "control" && (<>
              <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">Evalúa tus síntomas de TDAH de forma simple</h1>
              <p className="text-gray-600">Un punto de partida rápido para entender mejor tus síntomas y qué hacer después.</p>
            </>)}

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Check size={16} className="text-black" />Orientación clara al final del test</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-black" />Datos privados y seguros</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-black" />4–6 minutos aprox.</li>
            </ul>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button onClick={handlePrimary} disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-50">
                {loading ? "Cargando…" : variant === "B" ? "Comenzar evaluación" : "Empezar ahora"}
              </button>
              <span className="text-xs text-gray-500">Sin costo · Resultado orientativo</span>
            </div>
          </div>

          <div className="order-first -mx-2 md:order-none md:mx-0">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-semibold text-gray-900">4–6</p><p className="text-xs text-gray-500">minutos</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-semibold text-gray-900">100%</p><p className="text-xs text-gray-500">online</p></div>
                <div className="rounded-xl bg-gray-50 p-3"><p className="text-2xl font-semibold text-gray-900">✓</p><p className="text-xs text-gray-500">orientativo</p></div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">Este test no reemplaza una evaluación clínica completa.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}