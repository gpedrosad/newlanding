// src/app/lib/ab.ts  (SERVER ONLY: lectura de cookies)
import 'server-only';
import { cookies } from 'next/headers';

/** Lee anon_id si existe (httpOnly la crea /api/.../start). */
export async function getAnonFromCookies(): Promise<string | null> {
  const jar = await cookies(); // Next 15: async
  return jar.get('anon_id')?.value ?? null;
}

/**
 * Devuelve variante SSR + estado de cookie para persistir en cliente.
 * NO escribe cookies aquí (prohibido en RSC).
 */
export async function getHeroVariantForSSR(slug = 'hero-tdah'): Promise<{
  variant: 'A' | 'B';
  cookieKey: string;
  hadCookie: boolean;
}> {
  const jar = await cookies(); // async
  const key = `exp_${slug}`;
  const v = jar.get(key)?.value;

  if (v === 'A' || v === 'B') {
    return { variant: v, cookieKey: key, hadCookie: true };
  }

  const chosen: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
  return { variant: chosen, cookieKey: key, hadCookie: false };
}