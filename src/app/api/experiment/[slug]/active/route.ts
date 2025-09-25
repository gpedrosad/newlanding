import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin"; // NO lo importes en cliente

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { visit_id, deltaSec } = await req.json().catch(() => ({} as { visit_id?: string; deltaSec?: number }));
  if (!visit_id || typeof deltaSec !== "number") {
    return NextResponse.json({ ok: false, error: "visit_id y deltaSec requeridos" }, { status: 400 });
  }

  // clamp también del lado server (definitivo)
  const delta = Math.max(1, Math.min(Math.floor(deltaSec), 15));

  const { error } = await getSupabaseAdmin().rpc("rpc_add_active", {
    p_visit_id: visit_id,
    p_delta: delta,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}