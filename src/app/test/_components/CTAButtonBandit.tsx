// src/app/test/_components/CTAButtonBandit.tsx  (SERVER COMPONENT)
import { getHeroVariantForSSR } from "@/app/lib/ab";
import CTAButtonBanditClient from "@/app/test/_components/CTAButtonBanditClient";

type Labels = Partial<Record<"A" | "B" | "control", string>>;

export default async function CTAButton({
  slug = "cta-copy",
  className = "",
  labels,
  href,
}: {
  slug?: string;
  className?: string;
  labels?: Labels;
  href?: string;
}) {
  const { variant, cookieKey, hadCookie } = await getHeroVariantForSSR(slug);

  // Garantizá que el client reciba solo "A" | "B"
  const safeVariant: "A" | "B" = variant === "A" || variant === "B" ? variant : "A";

  return (
    <CTAButtonBanditClient
      initialVariant={safeVariant}
      persistCookieKey={cookieKey}
      shouldPersist={!hadCookie}
      slug={slug}
      className={className}
      labels={labels}
      href={href}
    />
  );
}