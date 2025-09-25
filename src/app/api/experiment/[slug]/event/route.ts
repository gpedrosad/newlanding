// src/app/api/experiment/[slug]/event/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

type EventType = "scroll_first" | "form_start" | "cta_click" | string;
interface EventBody { visit_id: string; type: EventType; }

function parseEventBody(input: unknown): EventBody | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  const visit_id = obj.visit_id;
  const type = obj.type;
  if (typeof visit_id === "string" && typeof type === "string") {
    return { visit_id, type };
  }
  return null;
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = null;
  }

  const body = parseEventBody(raw);
  if (!body) {
    return NextResponse.json(
      { ok: false, error: "visit_id y type requeridos" },
      { status: 400 },
    );
  }

  const { error } = await getSupabaseAdmin().rpc("rpc_log_event", {
    p_visit_id: body.visit_id,
    p_event_type: body.type,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}