"use client";

import React from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineStar, AiOutlineCheckCircle } from "react-icons/ai";
import Reviews from "../components/Reviews";

// ─────────────────────────────────────────────────────────────────────────────
// Facebook Pixel (front) + envío por API (CAPI)
// ─────────────────────────────────────────────────────────────────────────────
type FBQ = (event: "track" | "trackCustom" | string, ...args: unknown[]) => void;
const getFbq = () => (globalThis as unknown as { fbq?: FBQ }).fbq; // getter dinámico

const makeEventId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ⚠️ TEST EVENTS: hardcode para probar en Events Manager → Test Events
//    Para DESACTIVAR, cambia a: const FRONT_TEST_EVENT_CODE: string | undefined = undefined;
const FRONT_TEST_EVENT_CODE: string | undefined = "TEST36133";

// Reintenta enviar al Pixel si fbq aún no está listo
function trackWithRetry(
  eventName: "ViewContent" | "InitiateCheckout" | string,
  params: Record<string, unknown>,
  eventId?: string,
  retries = 25,
  intervalMs = 200
) {
  let attempts = 0;
  const trySend = () => {
    attempts++;
    const f = getFbq();
    if (typeof f === "function") {
      try {
        if (eventId) {
          f("track", eventName, params, { eventID: eventId });
        } else {
          f("track", eventName, params);
        }
        console.log(`[Pixel] ${eventName} enviado`, { params, eventId });
      } catch (e) {
        console.warn(`[Pixel] Error enviando ${eventName}`, e);
      }
      return;
    }
    if (attempts < retries) {
      setTimeout(trySend, intervalMs);
    } else {
      console.warn(`[Pixel] fbq no disponible tras ${retries} intentos (${eventName})`);
    }
  };
  trySend();
}

// Atribución básica para CAPI
function collectAttribution(base: Record<string, string> = {}) {
  const meta: Record<string, string> = { ...base };
  try {
    const usp = new URLSearchParams(window.location.search);
    for (const k of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ]) {
      const v = usp.get(k);
      if (v) meta[k] = v;
    }
    const cs = document.cookie || "";
    const fbc = /(?:^|;\s*)_fbc=([^;]+)/.exec(cs)?.[1];
    const fbp = /(?:^|;\s*)_fbp=([^;]+)/.exec(cs)?.[1];
    if (fbc) meta.fbc = fbc;
    if (fbp) meta.fbp = fbp;

    meta.url = window.location.href;
    if (document.referrer) meta.referrer = document.referrer;
  } catch {
    /* no-op */
  }
  return meta;
}

// Envío por API a tu backend (Conversions API)
async function sendInitiateCheckoutToAPI(payload: {
  event_id: string;
  value: number;
  currency: string;
  content_ids?: string[];
  content_type?: string;
  source?: string;
  meta?: Record<string, string>;
  test_event_code?: string;
}) {
  try {
    const res = await fetch("/api/meta/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_name: "InitiateCheckout",
        event_id: payload.event_id,
        value: payload.value,
        currency: payload.currency,
        content_ids: payload.content_ids,
        content_type: payload.content_type,
        source: payload.source,
        meta: payload.meta,
        client_ts: Date.now(),
        // ← se envía al backend para que pegue a Graph en modo "Test Events"
        test_event_code: payload.test_event_code,
      }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("[API] /api/meta/track respondió error", j);
    } else {
      console.log("[API] InitiateCheckout enviado a /api/meta/track", j);
    }
  } catch (e) {
    console.warn("[API] Error enviando InitiateCheckout", e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos y datos
// ─────────────────────────────────────────────────────────────────────────────
type Dias = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
type HorariosSeleccionados = Record<Dias, string[]>;

interface ProfileData {
  name: string | null;
  profession: string;
  professionalDescription: string | null;
  specializations: string[] | null;
  photo: string | null;
  services:
    | Array<{
        id: string;
        name: string;
        price_ars: number | null;
        duration: number | null;
        selected_slots: HorariosSeleccionados | null;
      }>
    | null;
  professional_id: string | null;
}

const Profile: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const currency = "CLP" as const; // cambia a "ARS" si corresponde
  const moneyLocale = currency === "CLP" ? "es-CL" : "es-AR";
  const formatMoney = (n: number | null | undefined) =>
    typeof n === "number" ? n.toLocaleString(moneyLocale) : "-";

  const profileData: ProfileData = {
    name: "Gonzalo Pedrosa",
    profession: "Psicólogo Clínico",
    professionalDescription:
      "Con más de 7 años de experiencia ayudando a pacientes a encontrar el equilibrio emocional, ofrezco un enfoque integrador basado en evidencia y técnicas modernas de psicoterapia.",
    specializations: ["Terapia Cognitiva", "Mindfulness", "Depresión", "Ansiedad", "Estrés", "Autoestima"],
    photo: "/yo.png",
    services: [
      {
        id: "service2",
        name: "Sesión Psicológica",
        price_ars: 30000,
        duration: 50,
        selected_slots: {
          Lunes: ["11:00 - 11:45"],
          Martes: ["12:00 - 12:45"],
          Miércoles: ["10:00 - 10:45"],
          Jueves: ["14:00 - 14:45"],
          Viernes: ["16:00 - 16:45"],
          Sábado: [],
          Domingo: [],
        },
      },
    ],
    professional_id: "prof123",
  };

  const primaryService = profileData.services?.[0];
  const averageRating = 4.8;
  const reviewCount = 281;
  const isRatingLoading = false;

  // ViewContent al montar (Pixel front)
  React.useEffect(() => {
    if (!mounted) return;
    const vcEventId = makeEventId("vc-profile");
    trackWithRetry(
      "ViewContent",
      {
        content_name: profileData.name || "Profile",
        content_category: "professional_profile",
        content_ids: primaryService?.id ? [primaryService.id] : undefined,
        content_type: "service",
        value: primaryService?.price_ars ?? 0,
        currency,
      },
      vcEventId
    );
  }, [mounted, currency, primaryService?.id, primaryService?.price_ars, profileData.name]);

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <div className="flex text-[#FFB703]">
        {Array.from({ length: 5 }, (_, i) =>
          i < roundedRating ? <AiFillStar key={i} size={30} /> : <AiOutlineStar key={i} size={30} />
        )}
      </div>
    );
  };

  // Clic en CTA -> InitiateCheckout (Pixel + API). Sin redirección.
  const handleAgendarClick = (source: "inline" | "sticky" = "inline") => {
    const price = primaryService?.price_ars ?? 0;
    const icEventId = makeEventId("ic-profile");

    // 1) Pixel (front)
    trackWithRetry(
      "InitiateCheckout",
      {
        value: price,
        currency,
        content_ids: primaryService?.id ? [primaryService.id] : undefined,
        content_type: "service",
        source,
      },
      icEventId
    );

    // 2) API (CAPI) — con test_event_code si está definido
    const meta = collectAttribution({ page: "profile", source });
    void sendInitiateCheckoutToAPI({
      event_id: icEventId,
      value: price,
      currency,
      content_ids: primaryService?.id ? [primaryService.id] : undefined,
      content_type: "service",
      source,
      meta,
      test_event_code: FRONT_TEST_EVENT_CODE,
    });

    console.log("[Profile] InitiateCheckout (Pixel + API)", {
      source,
      price,
      currency,
      event_id: icEventId,
      test_event_code: FRONT_TEST_EVENT_CODE,
    });
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="w-full bg-white rounded-lg shadow-lg p-10 md:p-16">
        <div className="mb-4">
          <span className="inline-block bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            Profesional Recomendado
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Image
            src={profileData.photo || "/images/placeholder.jpg"}
            alt={profileData.name || "Perfil"}
            width={240}
            height={240}
            priority
            className="rounded-lg mb-4 object-cover"
          />
          <h2 className="text-2xl md:text-4xl font-bold">{profileData.name}</h2>
          <p className="text-gray-500 text-xl md:text-2xl">{profileData.profession}</p>

          <div className="flex flex-col items-center mt-4 space-y-1">
            {isRatingLoading ? (
              <div className="w-24 h-6 bg-gray-300 animate-pulse rounded" />
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-gray-800 text-2xl md:text-3xl font-semibold">{averageRating.toFixed(1)}</p>
                {renderStars(averageRating)}
              </div>
            )}
            {isRatingLoading ? (
              <div className="w-32 h-4 bg-gray-300 animate-pulse rounded mt-2" />
            ) : (
              <p className="text-gray-500 text-md md:text-lg">({reviewCount} evaluaciones)</p>
            )}
          </div>
        </div>

        <div className="flex items-center p-4 bg-[#023047] rounded-lg text-gray-800 mt-8 max-w-lg mx-auto">
          <AiOutlineCheckCircle className="text-white mr-2" size={24} />
          <span className="text-white">
            Atiende solo en <strong className="font-semibold">modalidad online</strong>.
          </span>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">Sobre mi</h3>
          <p className="text-gray-700 text-lg">{profileData.professionalDescription || "No hay descripción disponible."}</p>
        </div>

        <div className="mt-12">
          <hr className="my-6 border-gray-300" />
          <h3 className="text-xl md:text-3xl font-semibold mb-4 text-left">Me especializo en:</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {profileData.specializations ? (
              profileData.specializations.map((specialization, index) => (
                <span key={index} className="bg-[#023047] text-white text-sm md:text-xl font-medium px-3 py-1 rounded-full">
                  {specialization}
                </span>
              ))
            ) : (
              <p>No indica especializaciones.</p>
            )}
          </div>
          <hr className="my-6 border-gray-300" />
        </div>

        <div className="mt-12">
          <h3 className="text-2xl md:text-3xl font-semibold mb-6">Servicios ofrecidos</h3>
          {profileData.services ? (
            profileData.services.map((service) => (
              <div
                key={service.id}
                className="p-6 bg-white border-l-4 border-[#023047] rounded-lg mb-6 w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex flex-col space-y-4">
                  <h4 className="text-xl font-bold text-[#023047]">{service.name}</h4>

                  <div className="flex flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{service.duration} minutos</span>
                    </div>

                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-lg text-[#023047]">
                        {formatMoney(service.price_ars)} {currency}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAgendarClick("inline")}
                    className="flex w-full bg-[#023047] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#03506f] active:scale-95 transition-all duration-200 justify-center items-center space-x-2"
                    data-cta="agendar-inline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Agendar sesión</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No hay servicios disponibles.</p>
          )}
        </div>
      </div>

      <div className="h-24 md:hidden" aria-hidden />

      <Reviews />

      <hr className="w-full border-gray-300 mt-12 mb-8" />

      <div className="w-full bg-white p-6 text-center text-gray-600">
        <p>© 2025 Ansiosamente. Todos los derechos reservados.</p>
      </div>

      {primaryService && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-xl flex items-center gap-3 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{primaryService.name}</span>
              <span className="text-base font-semibold text-[#023047]">
                {formatMoney(primaryService.price_ars)} {currency}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleAgendarClick("sticky")}
              className="ml-auto inline-flex items-center justify-center rounded-xl bg-[#023047] text-white px-5 py-3 font-semibold shadow-sm hover:bg-[#03506f] active:scale-95 transition"
              data-cta="agendar-sticky"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;