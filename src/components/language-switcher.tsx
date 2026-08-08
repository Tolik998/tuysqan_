"use client";

import { useLocaleStore } from "@/store/locale-store";

export function LanguageSwitcher({ inverse = false }: { inverse?: boolean }) {
  const { locale, setLocale } = useLocaleStore();
  return (
    <div
      className={`flex items-center rounded-md border p-0.5 text-xs font-bold ${inverse ? "border-white/25" : "border-[#020D13]/15"}`}
      aria-label="Язык"
    >
      {(["ru", "kk"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          className={`min-h-8 rounded px-2.5 uppercase transition ${
            locale === value
              ? inverse
                ? "bg-[#FFFBFC] text-[#020D13]"
                : "bg-[#020D13] text-[#FFFBFC]"
              : inverse
                ? "text-white/70"
                : "text-[#020D13]/55"
          }`}
          aria-pressed={locale === value}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
