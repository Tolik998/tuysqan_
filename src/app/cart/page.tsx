import { CartPanel } from "@/components/cart/cart-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="mb-8 text-4xl font-bold">Корзина</h1>
        <CartPanel />
      </main>
      <SiteFooter />
    </>
  );
}
