import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/logo";
export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#020D13] p-5">
      <div className="w-full max-w-md rounded-xl bg-[#FFFBFC] p-7 sm:p-9">
        <Logo />
        <p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#020D13]/45">
          Панель управления
        </p>
        <h1 className="mt-3 text-3xl font-bold">Вход для команды</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
