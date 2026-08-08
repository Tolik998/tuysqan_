import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login?reason=not-configured");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const profile = await supabase
    .from("profiles")
    .select("role,display_name")
    .eq("id", user.id)
    .single();
  if (profile.error || profile.data?.role !== "admin")
    redirect("/admin/login?reason=forbidden");
  return { supabase, user, profile: profile.data };
}

export async function verifyAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile.data?.role === "admin" ? { supabase, user } : null;
}
