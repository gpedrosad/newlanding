'use client';

import React from 'react';

type FBQ = (event: 'track' | 'trackCustom' | string, ...args: unknown[]) => void;
const fbq: FBQ | undefined = (globalThis as unknown as { fbq?: FBQ }).fbq;

type PayButtonProps = {
  amount: number;               // ARS
  endpoint?: string;            // default: '/api/paySuscribe'
  label?: string;               // texto del botón
  className?: string;
  onError?: (msg: string) => void;
};

export default function PayButton({
  amount,
  endpoint = '/api/paySuscribe',
  label = 'Pagar con Mercado Pago',
  className = '',
  onError,
}: PayButtonProps) {
  const [busy, setBusy] = React.useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);

    // ----- Metadata: UTM + cookies (_fbc/_fbp) -----
    const metadata: Record<string, string> = { source: 'suscribirse_button' };
    try {
      const usp = new URLSearchParams(window.location.search);
      const utmKeys = [
        'utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid',
      ];
      utmKeys.forEach((k) => {
        const v = usp.get(k);
        if (v) metadata[k] = v;
      });
      const cs = document.cookie || '';
      const fbc = /(?:^|;\s*)_fbc=([^;]+)/.exec(cs)?.[1];
      const fbp = /(?:^|;\s*)_fbp=([^;]+)/.exec(cs)?.[1];
      if (fbc) metadata.fbc = fbc;
      if (fbp) metadata.fbp = fbp;
    } catch { /* no-op */ }

    // ----- Pixel: InitiateCheckout -----
    try {
      const icEventId = `ic-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
      fbq?.('track', 'InitiateCheckout', { value: amount, currency: 'ARS' }, { eventID: icEventId });
    } catch { /* no-op */ }

    // ----- Backend call (solo amount + metadata) -----
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, metadata }),
      });
      const data = await res.json();
      if (!res.ok || !data?.init_point) {
        throw new Error(data?.error || 'No se pudo iniciar el pago. Intentá de nuevo.');
      }
      window.location.href = data.init_point as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al pagar.';
      onError?.(msg);
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
      className={`mt-6 w-full rounded-xl py-3 text-base font-semibold shadow
        ${busy ? 'bg-neutral-400 text-white cursor-not-allowed'
               : 'bg-neutral-900 text-white hover:bg-neutral-800'}
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900
        ${className}`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {busy ? 'Procesando…' : label}
        <span className="relative h-5 w-24">
         
        </span>
        {busy && (
          <span className="ml-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
      </span>
    </button>
  );
}