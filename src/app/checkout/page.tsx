import { DeliveryCheckout } from "@/components/checkout/delivery-checkout";
import { SiteHeader } from "@/components/site-header";
export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen max-w-[1200px] px-5 py-10 sm:px-8">
        <DeliveryCheckout />
      </main>
    </>
  );
}
