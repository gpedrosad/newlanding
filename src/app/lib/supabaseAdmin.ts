// src/app/lib/supabaseAdmin.ts  (SERVER ONLY)
import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  // Usa la URL pública o la privada, según cómo la tengas configurada
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!url) throw new Error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

  adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'X-Client-Info': 'admin-routes' } },
  });
  return adminClient;
}