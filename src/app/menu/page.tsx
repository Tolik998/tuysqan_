import type { Metadata } from "next";
import { MenuExperience } from "@/components/menu/menu-experience";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getMenuData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Меню",
  description:
    "Полное меню Tuysqan: завтраки, горячие блюда, восточная кухня, пицца, суши и сеты.",
};
export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ dish?: string | string[] }>;
}) {
  const [{ categories, items }, params] = await Promise.all([
    getMenuData(),
    searchParams,
  ]);
  const initialDishSlug =
    typeof params.dish === "string" ? params.dish : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#020D13] px-5 py-12 text-white sm:px-8 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/45">
              Макинск
            </p>
            <h1 className="mt-3 text-4xl font-bold sm:text-6xl">
              Меню Tuysqan
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
              Все блюда и цены перенесены из актуального меню Tuysqan и
              суши-материалов.
            </p>
          </div>
        </section>
        <MenuExperience
          categories={categories}
          items={items}
          initialDishSlug={initialDishSlug}
        />
      </main>
      <SiteFooter />
    </>
  );
}
