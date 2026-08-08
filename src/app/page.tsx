import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Instagram,
  MapPin,
  MessageCircle,
  QrCode,
} from "lucide-react";
import {
  KazakhCornerOrnament,
  KazakhOrnament,
} from "@/components/kazakh-ornament";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { menuItems, restaurantSettings } from "@/data/menu";
import { formatPrice } from "@/lib/utils";

const featured = menuItems.filter((item) => item.isFeatured).slice(0, 4);

export default function HomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Tuysqan",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ТД Satti, улица Михаила Яглинского, 36н",
      addressLocality: "Макинск",
      addressRegion: "Акмолинская область",
      addressCountry: "KZ",
    },
    telephone: restaurantSettings.phone,
    servesCuisine: ["Казахская", "Восточная", "Европейская", "Японская"],
    sameAs: [restaurantSettings.instagramUrl],
  };
  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <section className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-[#020D13] text-[#FFFBFC]">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
            <Image
              src="/menu-assets/page-26-image-10.png"
              alt="Блюда Tuysqan"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 58vw"
              className="object-cover opacity-70 lg:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#020D13] via-[#020D13]/75 to-transparent" />
          </div>
          <KazakhOrnament />
          <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-10">
            <div className="max-w-2xl reveal">
              <div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-white/55">
                <MapPin className="size-4" />
                Макинск · Казахстан
              </div>
              <h1 className="text-[clamp(3.2rem,9vw,8.5rem)] font-bold leading-[.86] tracking-[-.065em]">
                Традиции.
                <br />В новом
                <br />
                ритме.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                Tuysqan соединяет этно-казахскую культуру, современный лофт и
                тёплое гостеприимство — в каждом блюде и каждой встрече.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/menu"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-md bg-[#FFFBFC] px-7 font-bold text-[#020D13]"
                >
                  Посмотреть меню <ArrowRight className="size-4" />
                </Link>
                <a
                  href={`https://wa.me/${restaurantSettings.whatsapp}`}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-md border border-white/25 px-7 font-bold"
                >
                  <MessageCircle className="size-5" />
                  Заказать
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="relative mx-auto max-w-[1440px] overflow-hidden px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <KazakhCornerOrnament />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-[#020D13]/45">
                Tuysqan · туысқан
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                Место, где традиции встречаются с современностью.
              </h2>
            </div>
            <div className="grid content-end gap-6">
              <p className="max-w-2xl text-base leading-8 text-[#020D13]/62">
                В Tuysqan казахские традиции звучат современно. Пространство
                объединяет природные материалы, орнаменты, ковры и эстетику
                лофта, чтобы каждый гость чувствовал тепло дома.
              </p>
              <div className="ornament-rule mt-4" />
            </div>
          </div>
        </section>
        <section className="bg-[#efe5d5] py-20 lg:py-24">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <div className="mb-9 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#020D13]/45">
                  Выбор гостей
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-5xl">
                  Попробуйте Tuysqan
                </h2>
              </div>
              <Link
                href="/menu"
                className="hidden items-center gap-2 text-sm font-bold sm:flex"
              >
                Всё меню <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {featured.map((item) => (
                <Link
                  href={`/menu?dish=${item.slug}`}
                  key={item.id}
                  className="group bg-[#FFFBFC]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#020D13]">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.nameRu}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-contain p-2 transition duration-300 group-hover:opacity-90"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold sm:text-lg">
                      {item.nameRu}
                    </h3>
                    <p className="mt-2 text-sm font-bold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/menu"
              className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#020D13] px-5 text-sm font-bold text-white sm:hidden"
            >
              Всё меню <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="relative min-h-[520px] overflow-hidden bg-[#020D13] text-white">
              <Image
                src="/promos/japanese-fairy-tale.jpeg"
                alt="Суши-сет Японская сказка"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020D13] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">
                  Суши и роллы
                </p>
                <h2 className="mt-3 text-4xl font-bold">Японская сказка</h2>
                <Link
                  href="/menu"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-[#020D13]"
                >
                  Выбрать сет <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="grid gap-5">
              <div className="bg-[#020D13] p-8 text-white sm:p-10">
                <QrCode className="size-8" />
                <h2 className="mt-12 text-3xl font-bold">Заказ за столик</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/60">
                  Откройте QR-меню, выберите блюда и отправьте заказ прямо на
                  кухню.
                </p>
                <Link
                  href="/dine-in"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-[#020D13]"
                >
                  Открыть QR-меню <ArrowRight className="size-4" />
                </Link>
              </div>
              <div
                id="contacts"
                className="border border-[#020D13]/10 bg-white p-8 sm:p-10"
              >
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#020D13]/45">
                  Мы рядом
                </p>
                <h2 className="mt-3 text-3xl font-bold">Макинск</h2>
                <p className="mt-3 text-sm text-[#020D13]/55">
                  {restaurantSettings.address}, Акмолинская область. Актуальные
                  часы работы — в 2GIS.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={restaurantSettings.twoGisUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#020D13] px-5 text-sm font-bold text-white"
                  >
                    <MapPin className="size-4" />
                    2GIS
                  </a>
                  <a
                    href={restaurantSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#020D13]/15 px-5 text-sm font-bold"
                  >
                    <Instagram className="size-4" />
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
