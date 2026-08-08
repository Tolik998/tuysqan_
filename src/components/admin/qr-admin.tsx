"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { Download, Printer, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminTitle } from "@/components/admin/menu-admin";
import { Button } from "@/components/ui/button";
import type { RestaurantTable } from "@/types/domain";

export function QrAdmin({ tables }: { tables: RestaurantTable[] }) {
  const [selected, setSelected] = useState("");
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  useEffect(() => {
    const base = window.location.origin;
    const target = selected
      ? `${base}/dine-in?table=${encodeURIComponent(selected)}`
      : `${base}/dine-in`;
    QRCode.toDataURL(target, {
      width: 768,
      margin: 2,
      color: { dark: "#020D13", light: "#FFFBFC" },
    }).then((result) => {
      setUrl(target);
      setQr(result);
    });
  }, [selected]);
  function download() {
    const a = document.createElement("a");
    a.href = qr;
    a.download = selected
      ? `tuysqan-table-${selected}.png`
      : "tuysqan-dine-in.png";
    a.click();
  }
  return (
    <div>
      <AdminTitle
        title="QR-коды"
        subtitle="Печатные QR-коды для общего меню и отдельных столов"
      />
      <div className="grid max-w-4xl gap-6 lg:grid-cols-[320px_1fr]">
        <div className="border border-[#020D13]/10 bg-white p-5">
          <label className="grid gap-2 text-sm font-bold">
            Стол
            <select
              className="h-12 rounded-md border bg-white px-3"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Общий вход /dine-in</option>
              {tables
                .filter((t) => t.isActive)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
            </select>
          </label>
          <p className="mt-5 break-all text-xs leading-5 text-[#020D13]/50">
            {url}
          </p>
          <div className="mt-5 grid gap-2">
            <Button onClick={download} disabled={!qr}>
              <Download className="size-4" />
              Скачать PNG
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Печать
            </Button>
          </div>
        </div>
        <div className="grid place-items-center border border-[#020D13]/10 bg-white p-8 text-center">
          {qr ? (
            <div>
              <Image
                src={qr}
                alt="QR-код Tuysqan"
                width={320}
                height={320}
                unoptimized
              />
              <p className="mt-5 text-2xl font-bold">
                {selected
                  ? `Стол ${tables.find((t) => t.id === selected)?.label}`
                  : "Меню Tuysqan"}
              </p>
              <p className="mt-2 text-sm text-[#020D13]/50">
                Наведите камеру и сделайте заказ
              </p>
            </div>
          ) : (
            <QrCode className="size-12 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
