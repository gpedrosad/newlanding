// src/app/test/_components/HeroBanditClient.tsx  (CLIENT)
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Clock } from "lucide-react";

type Props = {
  initialVariant: "A" | "B";
  persistCookieKey: string;
  shouldPersist: boolean;
  anonFromCookie?: string;
  slug: string;
  className?: string;
  children?: React.ReactNode; // CTA inyectado desde el Server wrapper
};

type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };
declare global { interface Window { __visit_id?: string } }

export default function HeroBanditClient({
  initialVariant,
  persistCookieKey,
  shouldPersist,
  anonFromCookie,
  slug,
  className = "",
  children,
}: Props) {
  const router = useRouter();
  const [variant] = React.useState<"A" | "B">(initialVariant);
  const [anon] = React.useState<string | undefined>(anonFromCookie);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [, setLoading] = React.useState(false); // ← solo cambio: no usamos 'loading', mantenemos setLoading
  const startedRef = React.useRef(false);

  // Persist cookie de variante del HERO si no existía (solo cliente)
  React.useEffect(() => {
    if (!shouldPersist) return;
    const maxAge = 60 * 60 * 24 * 30; // 30 días
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${persistCookieKey}=${variant}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }, [shouldPersist, persistCookieKey, variant]);

  // Start visita (hero_view)
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
        const json: StartVisitResponse = await res.json();
        if (!aborted && json?.visit_id) {
          setVisitId(json.visit_id);
          window.__visit_id = json.visit_id;
        }
      } catch { /* noop */ }
    })();

    return () => { aborted = true; };
  }, [variant, slug]);

  // Click primario del HERO (navegación/scroll + opcional conversión por anon)
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

    const form = document.getElementById("form-start");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    else router.push("/test/tdah?step=1");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={
        "relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm " +
        className
      }
    >
      {/* blob animado de fondo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-black/5 blur-3xl"
        animate={{ scale: [1, 1.06, 1], x: [0, -12, 0], y: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto max-w-4xl px-4 py:10 sm:px-6 md:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid items-center gap-6 md:grid-cols-2"
          variants={{
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06, when: "beforeChildren" } },
          }}
        >
          <div className="space-y-4">
            {/* Crossfade entre variantes del título/copy */}
            <AnimatePresence mode="wait">
              <motion.div
                key={variant}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {variant === "A" ? (
                  <>
                    <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                      Test breve de TDAH, <span className="underline decoration-black/20">sin vueltas</span>
                    </h1>
                    <p className="text-gray-600">
                      Cuestionario inicial en 4–6 minutos. Obtén una indicación clara para decidir si vale la pena una
                      evaluación completa.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                      ¿Conviene evaluar TDAH? Descúbrelo en 4min
                    </h1>
                    <p className="text-gray-600">
                      Si te identificas con distracciones, olvidos o impulsividad, este cuestionario te da una
                      orientación inicial sobre TDAH. 
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.ul
              className="mt-4 space-y-2 text-sm text-gray-700"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
            >
              <li className="flex items-center gap-2"><Check size={16} className="text-black" />Orientación clara al final del test</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-black" />Datos privados y seguros</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-black" />4–6 minutos aprox.</li>
            </motion.ul>

            <motion.div
              className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.1 }}
            >
              {/* ⬇️ Envolvemos el CTA para que este componente maneje la navegación/scroll sin romper el logging del CTA */}
              <div onClick={handlePrimary}>
                {children}
              </div>
              <span className="text-xs text-gray-500">Sin costo · Resultado orientativo</span>
            </motion.div>
          </div>

          {/* Stats opcional */}
          {/* <HeroStats /> */}
        </motion.div>
      </div>
    </motion.section>
  );
}