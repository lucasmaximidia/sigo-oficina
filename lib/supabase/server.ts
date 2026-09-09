import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  // Não lança erro aqui de propósito: isso rodaria durante o build/coleta de
  // páginas do Next.js mesmo sem nenhuma requisição real acontecer. Sem as
  // credenciais reais, as chamadas ao Supabase falham em runtime com uma
  // mensagem clara do próprio client/fetch — o que já é suficiente para
  // diagnosticar. Configure as variáveis em .env.local antes de usar o app.
  console.warn("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configurados em .env.local");
}

// Cliente para uso em Server Components, Server Actions e Route Handlers.
// Lê/escreve a sessão do usuário logado via cookies, para que o RLS do
// banco veja as requisições como `authenticated` (não `anon`).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component (sem permissão de escrever
          // cookies) — a sessão é atualizada pelo middleware a cada requisição.
        }
      },
    },
  });
}
