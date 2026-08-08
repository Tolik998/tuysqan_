import { MenuAdmin } from "@/components/admin/menu-admin";
import { getMenuData } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function AdminMenuPage() {
  const data = await getMenuData();
  return <MenuAdmin initialItems={data.items} categories={data.categories} />;
}
