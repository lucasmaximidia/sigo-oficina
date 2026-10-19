import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY não configurada em .env.local");
}

// Cliente com a service role key: ignora RLS e não depende de cookies/sessão
// de usuário. Só deve ser usado em código que roda sem uma requisição de
// usuário logado por trás (ex.: o cron job de notificações) — nunca em
// Server Components/Actions normais, que devem continuar usando
// lib/supabase/server.ts para respeitar o RLS.
export function createServiceClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
