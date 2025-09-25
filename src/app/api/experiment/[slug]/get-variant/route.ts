// src/app/api/experiment/[slug]/get-variant/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

/* --- Thompson Sampling helpers --- */
function randGamma(k: number): number {
  if (k <= 0) return 0;
  if (k < 1) { const u = Math.random(); return randGamma(1 + k) * Math.pow(u, 1 / k); }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do {
      const u1 = Math.random(), u2 = Math.random();
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
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

type Variant = "A" | "B";
type Payload = { variant: Variant; anon_id: string; disabled?: boolean };

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> } // ⬅️ params ahora es Promise
) {
  const { slug } = await ctx.params;               // ⬅️ await
  const decodedSlug = decodeURIComponent(slug);
  const anon = crypto.randomUUID();

  // Solo A/B para este experimento
  const allowed: Variant[] = ["A", "B"];

  const { data: exp } = await getSupabaseAdmin()
    .from("experiments")
    .select("id,is_active")
    .eq("slug", decodedSlug)
    .single();

  if (!exp?.id || !exp.is_active) {
    const payload: Payload = { variant: "A", anon_id: anon, disabled: true };
    return NextResponse.json(payload);
  }

  const { data: variants } = await getSupabaseAdmin()
    .from("experiment_variants")
    .select("id,name,alpha,beta")
    .eq("experiment_id", exp.id)
    .in("name", allowed as string[]);

  // Fallback seguro
  if (!variants?.length) {
    const payload: Payload = { variant: "A", anon_id: anon };
    return NextResponse.json(payload);
  }

  // Thompson Sampling sobre A/B
  let winner = variants[0];
  let best = -1;
  for (const v of variants) {
    const s = sampleBeta(v.alpha, v.beta);
    if (s > best) { best = s; winner = v; }
  }

  const payload: Payload = { variant: winner.name as Variant, anon_id: anon };
  return NextResponse.json(payload);
}