// src/app/api/experiment/[slug]/start/route.ts
import { NextResponse } from "next/server";
// import { cookies } from "next/headers"; // PRUEBAS: no usar cookie anon_id por ahora
import { supabaseAdmin } from "../../../../lib/supabaseAdmin"; // NO lo importes en cliente

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = decodeURIComponent(params.slug);
  const { variant } = await req.json();

  // PRUEBAS: generar anon por request, sin persistir cookie
  // const jar = await cookies();
  // let anon = jar.get("anon_id")?.value;
  // if (!anon) {
  //   anon = crypto.randomUUID();
  //   jar.set("anon_id", anon, {
  //     path: "/",
  //     maxAge: 60 * 60 * 24 * 90,
  //     sameSite: "lax",
  //     secure: true,
  //     httpOnly: true,
  //   });
  // }
  const anon = crypto.randomUUID();

  const { data, error } = await supabaseAdmin.rpc("rpc_start_visit", {
    p_slug: slug,
    p_anon_id: anon,
    p_variant_name: variant,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, visit_id: data });
}