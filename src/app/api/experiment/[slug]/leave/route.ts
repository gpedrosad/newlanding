import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin"; // NO lo importes en cliente

// Recomendado para usar service key
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { visit_id } = await req.json().catch(() => ({} as { visit_id?: string }));
  if (!visit_id) {
    return NextResponse.json({ ok: false, error: "visit_id requerido" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().rpc("rpc_leave_visit", { p_visit_id: visit_id });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}