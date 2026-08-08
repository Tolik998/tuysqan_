import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  inverse = false,
  className,
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Tuysqan — главная"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/brand/logo.png"
        alt="Tuysqan"
        width={214}
        height={70}
        priority
        className={cn("h-8 w-auto object-contain", inverse && "invert")}
      />
    </Link>
  );
}
