import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function AboutPage() {
  const interiors = [2, 3, 4, 5, 6].map(
    (n) => `/brand/page-08-image-0${n}.jpg`,
  );
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#020D13] px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto max-w-[1100px]">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/45">
              О Tuysqan
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[.95] tracking-tight sm:text-7xl">
              Тепло, уважение к культуре и современный подход.
            </h1>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1100px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <h2 className="text-3xl font-bold sm:text-5xl">
            Гостеприимство, которое запоминается.
          </h2>
          <div className="space-y-5 text-base leading-8 text-[#020D13]/62">
            <p>
              Миссия Tuysqan — соединять этно-казахские традиции с современным
              стилем, стремиться к совершенству и создавать атмосферу
              индивидуального внимания.
            </p>
            <p>
              Интерьер объединяет современный лофт, казахские картины,
              орнаменты, ковры и природные материалы. Здесь уют встречается с
              эстетикой, а гость чувствует себя как дома.
            </p>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 px-2 pb-20 md:grid-cols-5">
          {interiors.map((src, index) => (
            <div
              key={src}
              className={`relative min-h-56 overflow-hidden bg-[#020D13] ${index === 1 ? "col-span-2 md:col-span-2" : ""}`}
            >
              <Image
                src={src}
                alt={`Интерьер Tuysqan ${index + 1}`}
                fill
                sizes="(max-width:768px) 50vw, 20vw"
                className="object-cover"
              />
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
