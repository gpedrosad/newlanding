// src/app/test/_components/HeroBandit.tsx  (SERVER COMPONENT)
import { getAnonFromCookies, getHeroVariantForSSR } from "@/app/lib/ab";
import CTAButton from "@/app/test/_components/CTAButtonBandit";
import HeroBanditClient from "./HeroBanditClient"; // ⬅️ Import directo (sin dynamic)

export default async function HeroBandit({
  slug = "hero-tdah",
  className = "",
}: {
  slug?: string;
  className?: string;
}) {
  const { variant, cookieKey, hadCookie } = await getHeroVariantForSSR(slug);
  const anon = await getAnonFromCookies();

  return (
    <HeroBanditClient
      initialVariant={variant}
      persistCookieKey={cookieKey}
      shouldPersist={!hadCookie}
      anonFromCookie={anon ?? undefined}
      slug={slug}
      className={className}
    >
      {/* CTA sin flicker (experimento independiente 'cta-copy') */}
      <CTAButton
        slug="cta-copy"
        className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-50"
        labels={{ A: "Comenzar evaluación", B: "Hacer test ahora", control: "Empezar ahora" }}
      />
    </HeroBanditClient>
  );
}