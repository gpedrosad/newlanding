// src/app/test/_components/CTAButtonBandit.tsx  (SERVER COMPONENT)
import { getHeroVariantForSSR } from "@/app/lib/ab";
import CTAButtonBanditClient from "@/app/test/_components/CTAButtonBanditClient"; // ⬅️ Import directo

export default async function CTAButton({
  slug = "cta-copy",
  className = "",
  labels,
  href,
}: {
  slug?: string;
  className?: string;
  labels?: Partial<Record<"A"|"B"|"control", string>>;
  href?: string;
}) {
  const { variant, cookieKey, hadCookie } = await getHeroVariantForSSR(slug);

  return (
    <CTAButtonBanditClient
      initialVariant={variant}
      persistCookieKey={cookieKey}
      shouldPersist={!hadCookie}
      slug={slug}
      className={className}
      labels={labels}
      href={href}
    />
  );
}