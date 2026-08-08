import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
export default function DineInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFBFC]">
      <header className="sticky top-0 z-40 border-b border-[#020D13]/8 bg-[#FFFBFC]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden h-5 w-px bg-[#020D13]/15 sm:block" />
            <span className="hidden text-xs font-bold uppercase tracking-wide text-[#020D13]/45 sm:block">
              Заказ в ресторане
            </span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      {children}
    </div>
  );
}
