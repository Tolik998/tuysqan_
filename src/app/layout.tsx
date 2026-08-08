import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Tuysqan — кафе в Макинске | Меню и заказ еды",
    template: "%s | Tuysqan",
  },
  description:
    "Tuysqan в Макинске: казахские традиции, современный стиль, меню и заказ доставки через WhatsApp.",
  applicationName: "Tuysqan",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "Tuysqan — традиции в современном ритме",
    description: "Меню, доставка и QR-заказ в ресторане Tuysqan, Макинск.",
    type: "website",
    url: "/",
    siteName: "Tuysqan",
    locale: "ru_KZ",
    images: [
      {
        url: "/og.png",
        width: 1730,
        height: 909,
        alt: "Tuysqan — Макинск, Казахстан",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tuysqan — кафе в Макинске",
    description: "Меню и заказ еды",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#020D13",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body className={`${montserrat.variable} antialiased`}>{children}</body>
    </html>
  );
}
