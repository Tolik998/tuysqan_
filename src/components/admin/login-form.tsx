"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const client = createClient();
    if (!client) {
      setError(
        "Подключение Supabase не настроено. Добавьте переменные окружения.",
      );
      setLoading(false);
      return;
    }
    const result = await client.auth.signInWithPassword({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    if (result.error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }
    router.replace(search.get("returnTo") || "/admin");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <label className="grid gap-2 text-sm font-bold">
        Email
        <Input name="email" type="email" required autoComplete="username" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Пароль
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <LockKeyhole className="size-5" />
        )}
        Войти
      </Button>
    </form>
  );
}
