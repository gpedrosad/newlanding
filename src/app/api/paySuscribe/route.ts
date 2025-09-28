// src/app/api/paySuscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { cookies, headers } from "next/headers";   // 👈 añade esto

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { amount, email, name, metadata } = (await request.json()) as {
      amount?: number; email?: string; name?: string;
      metadata?: Record<string, string | number | boolean>;
    };

    // 👇 lee cookies y headers (Next 15 usa await)
    const cookieStore = await cookies();
    const fbc = cookieStore.get("_fbc")?.value;
    const fbp = cookieStore.get("_fbp")?.value;

    const hdrs = await headers();
    const client_user_agent = hdrs.get("user-agent") || undefined;
    const client_ip_address =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      undefined;

    const ACCESS_TOKEN =
      //process.env.MP_TEST_ACCESS_TOKEN ?? //aqui cambiare luego
      process.env.MP_ACCESS_TOKEN ??
      "APP_USR-1954027804720492-081219-1fbb836695e4577bbbdc831fafb77d8d-1173814566";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.agendapp.com.ar";
    const mp = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

    // ✅ NUEVO: event_id único para deduplicar Purchase (pixel + CAPI)
    const purchaseEventId = `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const pref = await new Preference(mp).create({
      body: {
        items: [{ id: "agendapp_activation", title: "Pago sesión", unit_price: amount ?? 15000, quantity: 1, currency_id: "ARS" }],
        payer: email ? { email } : undefined,
        metadata: {
          ...(metadata || {}),
          plan: "plan_unico",
          customer_name: name ?? "",
          lead_email: email ?? "",
          lead_amount: amount ?? 15000,

          // 👇 lo importante para Meta CAPI
          fbc,
          fbp,
          client_user_agent,
          client_ip_address,

          // ✅ NUEVO: event_id para dedupe en webhook + /gracias
          event_id: purchaseEventId,
        },
        back_urls: {
          // ✅ NUEVO: pasamos el mismo event_id en la URL de éxito
          success: `${appUrl}/gracias?eid=${purchaseEventId}`,
          failure: `${appUrl}/suscribirse?status=failure`,
          pending: `${appUrl}/suscribirse?status=pending`,
        },
        auto_return: "approved",
        statement_descriptor: "AGENDAPP",
        notification_url: `https://www.agendapp.com.ar/api/paySuscribe/webhook`,
      },
    });

    return NextResponse.json({ init_point: pref.init_point! }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: "Error creando preferencia", detail: message }, { status: 500 });
  }
}