// lib/supabaseAdmin.ts (NO lo importes en cliente)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,          // URL pública
  process.env.SUPABASE_SERVICE_ROLE_KEY!,         // service role
  { auth: { persistSession: false } }
);