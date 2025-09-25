// src/app/test/page.tsx  (SERVER COMPONENT)
import HeroBandit from './_components/HeroBandit';
import FormClient from './_components/FormClient';

export default function Page() {
  return (
    <div className="min-h-svh w-full bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-black" />
            <span className="text-sm font-semibold text-gray-900">TDAH · Inicio</span>
          </div>
          <span className="text-xs text-gray-500">Paso 1 de 2</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <HeroBandit slug="hero-tdah" className="mb-8" />
        <FormClient />
      </main>
    </div>
  );
}