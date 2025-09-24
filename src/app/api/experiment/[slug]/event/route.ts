import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin"; // NO lo importes en cliente

// Fuerza runtime Node (recomendado para supabase service key)
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { visit_id, type } = await req.json().catch(() => ({} as any));

  if (!visit_id || !type) {
    return NextResponse.json({ ok: false, error: "visit_id y type requeridos" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.rpc("rpc_log_event", {
    p_visit_id: visit_id,
    p_event_type: type,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}