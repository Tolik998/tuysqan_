import { SettingsAdmin } from "@/components/admin/settings-admin";
import { restaurantSettings } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("restaurant_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  const fallback = {
    restaurant_name: restaurantSettings.name,
    city: restaurantSettings.city,
    address: "",
    phone: restaurantSettings.phone,
    whatsapp: restaurantSettings.whatsapp,
    instagram_url: restaurantSettings.instagramUrl,
    two_gis_url: restaurantSettings.twoGisUrl,
    working_hours: "",
    delivery_minimum: restaurantSettings.deliveryMinimum,
    delivery_text: "",
    currency: "KZT",
    default_language: "ru",
    notification_sound: true,
  };
  return <SettingsAdmin initial={result.data || fallback} />;
}
