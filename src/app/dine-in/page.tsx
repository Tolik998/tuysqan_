import { MenuExperience } from "@/components/menu/menu-experience";
import { getMenuData } from "@/lib/data";

export default async function DineInPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string | string[] }>;
}) {
  const { categories, items } = await getMenuData("dine_in");
  const params = await searchParams;
  const table = Array.isArray(params.table) ? params.table[0] : params.table;

  return (
    <main>
      <section className="bg-[#020D13] px-4 py-10 text-white">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/45">
            QR-меню
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Что закажем?</h1>
          <p className="mt-3 text-sm text-white/55">
            Выберите блюда — заказ уйдёт прямо команде Tuysqan.
          </p>
        </div>
      </section>
      <MenuExperience
        categories={categories}
        items={items}
        dineIn
        preselectedTable={table}
      />
    </main>
  );
}
