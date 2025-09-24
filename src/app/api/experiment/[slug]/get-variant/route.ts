// src/app/api/experiment/[slug]/get-variant/route.ts
import { NextResponse } from "next/server";
// import { cookies } from "next/headers"; // PRUEBAS: no usar cookie anon_id por ahora
import { supabaseAdmin } from "../../../../lib/supabaseAdmin"; // NO lo importes en cliente

/* --- Thompson Sampling helpers (igual que antes) --- */
function randGamma(k: number): number {
  if (k <= 0) return 0;
  if (k < 1) {
    const u = Math.random();
    return randGamma(1 + k) * Math.pow(u, 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let x: number, v: number;
    do {
      const u1 = Math.random();
      const u2 = Math.random();
      const n = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      x = n;
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function sampleBeta(alpha: number, beta: number) {
  const g1 = randGamma(Math.max(alpha, 1e-6));
  const g2 = randGamma(Math.max(beta, 1e-6));
  return g1 / (g1 + g2);
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = decodeURIComponent(params.slug);

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

  const { data: exp } = await supabaseAdmin
    .from("experiments")
    .select("id,is_active")
    .eq("slug", slug)
    .single();

  if (!exp?.id || !exp.is_active) {
    return NextResponse.json({ variant: "control", disabled: true, anon_id: anon });
  }

  // PRUEBAS: no reutilizar asignación previa mientras no usamos cookie
  // const { data: prev } = await supabaseAdmin
  //   .from("experiment_assignments")
  //   .select("variant_id, experiment_variants(name)")
  //   .eq("experiment_id", exp.id)
  //   .eq("anon_id", anon)
  //   .limit(1);
  // if (prev && prev.length > 0) {
  //   const vname = (prev[0] as any).experiment_variants.name as string;
  //   return NextResponse.json({ variant: vname, anon_id: anon });
  // }

  const { data: variants } = await supabaseAdmin
    .from("experiment_variants")
    .select("id,name,alpha,beta")
    .eq("experiment_id", exp.id);

  if (!variants?.length) {
    return NextResponse.json({ variant: "control", anon_id: anon });
  }

  let winner = variants[0];
  let best = -1;
  for (const v of variants) {
    const s = sampleBeta(v.alpha, v.beta);
    if (s > best) { best = s; winner = v; }
  }

  return NextResponse.json({ variant: winner.name as "A" | "B" | "control", anon_id: anon });
}