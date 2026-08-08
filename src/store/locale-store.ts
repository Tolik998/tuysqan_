"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/types/domain";

export const useLocaleStore = create<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>()(
  persist((set) => ({ locale: "ru", setLocale: (locale) => set({ locale }) }), {
    name: "tuysqan-locale",
  }),
);
