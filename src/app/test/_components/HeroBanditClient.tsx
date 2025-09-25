// src/app/test/_components/HeroBanditClient.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Shield, Clock } from 'lucide-react';
import HeroStats from './HeroStats';

type Props = {
  initialVariant: 'A' | 'B';
  persistCookieKey: string;  // p.ej. exp_hero-tdah
  shouldPersist: boolean;    // true si no existía cookie en SSR
  anonFromCookie?: string;
  slug: string;
  className?: string;
};

type StartVisitResponse = { ok: boolean; visit_id?: string; error?: string };
declare global { interface Window { __visit_id?: string } }

export default function HeroBanditClient({
  initialVariant,
  persistCookieKey,
  shouldPersist,
  anonFromCookie,
  slug,
  className = '',
}: Props) {
  const router = useRouter();
  const [variant] = React.useState<'A' | 'B'>(initialVariant);
  const [anon] = React.useState<string | undefined>(anonFromCookie);
  const [visitId, setVisitId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const startedRef = React.useRef(false);

  // 0) Si en SSR no había cookie de variante, persistirla en el cliente
  React.useEffect(() => {
    if (!shouldPersist) return;
    const maxAge = 60 * 60 * 24 * 30; // 30 días
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${persistCookieKey}=${variant}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }, [shouldPersist, persistCookieKey, variant]);

  // 1) Iniciar visita una sola vez
  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(`/api/experiment/${encodeURIComponent(slug)}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variant }),
          credentials: 'same-origin',
        });
        const json: StartVisitResponse = await res.json();
        if (!aborted && json?.visit_id) {
          setVisitId(json.visit_id);
          window.__visit_id = json.visit_id;
        }
      } catch {}
    })();

    return () => { aborted = true; };
  }, [variant, slug]);

  const leave = React.useCallback(() => {
    if (!visitId) return;
    const url = `/api/experiment/${encodeURIComponent(slug)}/leave`;
    const payload = JSON.stringify({ visit_id: visitId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [visitId, slug]);

  const sendActive = React.useCallback((deltaSec: number) => {
    if (!visitId || deltaSec <= 0) return;
    const url = `/api/experiment/${encodeURIComponent(slug)}/active`;
    const payload = JSON.stringify({ visit_id: visitId, deltaSec });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  }, [visitId, slug]);

  // 2) Bounce: primer scroll
  React.useEffect(() => {
    if (!visitId) return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      if (window.scrollY > 50) {
        fired = true;
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visit_id: visitId, type: 'scroll_first' }),
        }).catch(() => {});
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [visitId, slug]);

  // 3) Form start
  React.useEffect(() => {
    if (!visitId) return;
    let fired = false;
    const handler = () => {
      if (fired) return;
      fired = true;
      fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visit_id: visitId, type: 'form_start' }),
      }).catch(() => {});
      document.removeEventListener('focusin', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('focusin', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('focusin', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [visitId, slug]);

  // 4) Tiempo activo (heartbeat)
  React.useEffect(() => {
    if (!visitId) return;
    const lastActivityRef = { current: Date.now() };
    const markActivity = () => { lastActivityRef.current = Date.now(); };
    const isVisible = () => document.visibilityState === 'visible';
    const isActive = () => Date.now() - lastActivityRef.current < 10_000;

    let hbTimer: number | null = null;
    const start = () => { if (hbTimer === null) hbTimer = window.setInterval(() => {
      if (isVisible() && isActive()) sendActive(5);
    }, 5000); };
    const stop = () => { if (hbTimer !== null) { clearInterval(hbTimer); hbTimer = null; } };
    const onVis = () => { if (isVisible()) { markActivity(); start(); } else { stop(); } };

    ['mousemove','scroll','keydown','touchstart','click'].forEach((ev) =>
      window.addEventListener(ev, markActivity as EventListener, { passive: true })
    );
    document.addEventListener('visibilitychange', onVis);
    if (isVisible()) start();

    const onLeaveActive = () => { if (isVisible() && isActive()) sendActive(5); };
    window.addEventListener('pagehide', onLeaveActive);
    window.addEventListener('beforeunload', onLeaveActive);

    return () => {
      stop();
      ['mousemove','scroll','keydown','touchstart','click'].forEach((ev) =>
        window.removeEventListener(ev, markActivity as EventListener)
      );
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onLeaveActive);
      window.removeEventListener('beforeunload', onLeaveActive);
    };
  }, [visitId, sendActive]);

  // 5) Cerrar visita en navegación
  React.useEffect(() => {
    if (!visitId) return;
    const onLeave = () => leave();
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [visitId, leave]);

  // 6) Interceptar links internos SPA
  React.useEffect(() => {
    if (!visitId) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href');
      const target = a.getAttribute('target');
      const isInternal = href && href.startsWith('/') && (!target || target === '_self');
      if (isInternal) leave();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [visitId, leave]);

  const handlePrimary = async () => {
    try {
      setLoading(true);
      if (visitId) {
        fetch(`/api/experiment/${encodeURIComponent(slug)}/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visit_id: visitId, type: 'cta_click' }),
        }).catch(() => {});
      }
      if (anon) {
        await fetch(`/api/experiment/${encodeURIComponent(slug)}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anon_id: anon }),
        });
      }
    } finally {
      setLoading(false);
    }

    const form = document.getElementById('form-start');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else { leave(); router.push('/test/tdah?step=1'); }
  };

  return (
    <section className={'relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm ' + className}>
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-64 w-64 rounded-full bg-black/5 blur-3xl" />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid items-center gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {variant === 'A' && (<>
              <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                Test breve de TDAH, <span className="underline decoration-black/20">sin vueltas</span>
              </h1>
              <p className="text-gray-600">Screening inicial en 4–6 minutos. Obtén una indicación clara para decidir si vale la pena una evaluación completa.</p>
            </>)}
            {variant === 'B' && (<>
              <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-4xl">
                ¿Dudas de TDAH? Empieza con un <span className="underline decoration-black/20">screening guiado</span>
              </h1>
              <p className="text-gray-600">Responde un cuestionario breve y recibe una orientación práctica para tu siguiente paso terapéutico.</p>
            </>)}

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Check size={16} className="text-black" />Orientación clara al final del test</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-black" />Datos privados y seguros</li>
              <li className="flex items-center gap-2"><Clock size={16} className="text-black" />4–6 minutos aprox.</li>
            </ul>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button onClick={handlePrimary} disabled={loading} className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-50">
                {loading ? 'Cargando…' : variant === 'B' ? 'Comenzar evaluación' : 'Empezar ahora'}
              </button>
              <span className="text-xs text-gray-500">Sin costo · Resultado orientativo</span>
            </div>
          </div>

          <HeroStats />
        </motion.div>
      </div>
    </section>
  );
}