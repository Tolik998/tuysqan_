import { OrderStatus } from "@/components/dine-in/order-status";
import { getRestaurantSettings } from "@/lib/data";
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token = "" } = await searchParams;
  const settings = await getRestaurantSettings();
  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-3xl px-4 py-10 sm:px-6">
      <OrderStatus id={id} token={token} whatsapp={settings.whatsapp} />
    </main>
  );
}
