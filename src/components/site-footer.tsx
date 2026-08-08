import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { restaurantSettings } from "@/data/menu";

export function SiteFooter() {
  return (
    <footer id="contacts" className="bg-[#020D13] text-[#FFFBFC]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-8 lg:px-10">
        <div>
          <Logo inverse />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Казахские традиции, современный стиль и тёплое гостеприимство в
            Макинске.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-white/45">
            Навигация
          </p>
          <div className="grid gap-3 text-sm">
            <Link href="/menu">Меню</Link>
            <Link href="/about">О Tuysqan</Link>
            <Link href="/dine-in">Заказ в ресторане</Link>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-white/45">
            Контакты
          </p>
          <div className="grid gap-3 text-sm">
            <a
              className="flex items-center gap-2"
              href={`tel:${restaurantSettings.phone}`}
            >
              <Phone className="size-4" />
              {restaurantSettings.phone}
            </a>
            <a
              className="flex items-center gap-2"
              href={restaurantSettings.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="size-4" />
              Instagram
            </a>
            <a
              className="flex items-center gap-2"
              href={restaurantSettings.twoGisUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="size-4" />
              2GIS · Макинск
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Tuysqan. Макинск, Казахстан.
      </div>
    </footer>
  );
}
