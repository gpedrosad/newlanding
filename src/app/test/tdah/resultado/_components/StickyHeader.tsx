"use client";

export default function StickyHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-black" />
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {right ? <span className="text-xs text-gray-500">{right}</span> : null}
      </div>
    </header>
  );
}