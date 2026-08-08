import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tuysqan — заказ в ресторане",
    short_name: "Tuysqan",
    description: "Меню, доставка и QR-заказ Tuysqan",
    start_url: "/dine-in",
    display: "standalone",
    background_color: "#FFFBFC",
    theme_color: "#020D13",
    lang: "ru",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
