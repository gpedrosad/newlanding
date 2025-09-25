// src/app/test/_components/HeroBandit.tsx  (SERVER COMPONENT)
import { getAnonFromCookies, getHeroVariantForSSR } from '@/app/lib/ab';
import HeroBanditClient from './HeroBanditClient';

export default async function HeroBandit(props: { slug?: string; className?: string }) {
  const slug = props.slug ?? 'hero-tdah';

  const [{ variant, cookieKey, hadCookie }, anon] = await Promise.all([
    getHeroVariantForSSR(slug),
    getAnonFromCookies(),
  ]);

  return (
    <HeroBanditClient
      initialVariant={variant}
      persistCookieKey={cookieKey}
      shouldPersist={!hadCookie}     // si no había cookie, el cliente la guarda
      anonFromCookie={anon ?? undefined}
      slug={slug}
      className={props.className}
    />
  );
}