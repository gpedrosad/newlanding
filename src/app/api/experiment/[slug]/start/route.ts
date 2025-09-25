import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;                    // ⬅️ await
  const decodedSlug = decodeURIComponent(slug);
  const { variant } = await req.json();

  // Crear/leer anon_id AQUÍ (en route handler sí puedes setear cookies)
  const jar = await cookies();                          // Next 15: async
  let anon = jar.get("anon_id")?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    jar.set("anon_id", anon, {
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
      secure: true,
      httpOnly: true,
    });
  }

  const { data, error } = await supabaseAdmin.rpc("rpc_start_visit", {
    p_slug: decodedSlug,
    p_anon_id: anon,
    p_variant_name: variant,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, visit_id: data });
}