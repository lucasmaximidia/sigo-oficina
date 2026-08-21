import { createClient } from "@supabase/supabase-js";
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

// Sem Auth nesta v1 (acesso interno, 2 usuários, sem login).
// Quando Auth (email/senha) for adicionado, trocar por clientes
// separados de browser/server via @supabase/ssr, sem mudar o resto do app.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
