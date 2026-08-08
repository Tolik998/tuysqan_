import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, locale = "ru-RU") {
  return `${new Intl.NumberFormat(locale).format(value)} ₸`;
}

export function localize(
  locale: "ru" | "kk",
  ru?: string | null,
  kk?: string | null,
) {
  return (locale === "kk" ? kk || ru : ru || kk) || "";
}
