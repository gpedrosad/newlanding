import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";


export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as
    | { name?: string; email?: string; phone?: string; consent?: boolean }
    | null;

  if (!body?.name || !body?.email || body?.consent !== true) {
    return NextResponse.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert([{ name: body.name, email: body.email, phone: body.phone ?? null, consent: true }])
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}