import { createClient } from "@/lib/supabase/server";
import { PagamentoOperador } from "@/components/kids/pagamento-operador";

export const dynamic = "force-dynamic";

export default async function KidsPagamentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date();
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();

  const [{ data: precos }, { data: pagamentosHoje }] = await Promise.all([
    supabase.from("kids_precos").select("*").eq("ativo", true).order("ordem", { ascending: true }),
    user
      ? supabase
          .from("kids_pagamentos")
          .select("id, tempo_min, valor, forma_pagamento, status, created_at")
          .eq("operador_id", user.id)
          .gte("created_at", inicioDoDia)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="locacao-theme min-h-dvh bg-background">
      <PagamentoOperador precos={precos ?? []} pagamentosHoje={pagamentosHoje ?? []} />
    </div>
  );
}
