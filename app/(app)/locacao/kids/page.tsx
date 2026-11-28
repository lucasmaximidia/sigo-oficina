import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResumoKids, type PagamentoResumo } from "@/components/kids/resumo-kids";
import { PrecosKids } from "@/components/kids/precos-kids";
import { OperadoresKids } from "@/components/kids/operadores-kids";
import { listarOperadoresKids } from "@/lib/kids-actions";

export const dynamic = "force-dynamic";

export default async function LocacaoKidsPage() {
  const supabase = await createClient();

  const hoje = new Date();
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();

  const [{ data: precos }, { data: pagamentosRaw }, operadores] = await Promise.all([
    supabase.from("kids_precos").select("*").order("tempo_min", { ascending: true }),
    supabase
      .from("kids_pagamentos")
      .select("id, tempo_min, valor, forma_pagamento, status, created_at, operador_id")
      .gte("created_at", inicioDoDia)
      .order("created_at", { ascending: false }),
    listarOperadoresKids(),
  ]);

  // Não há FK entre kids_pagamentos e profiles (operador_id aponta pra
  // auth.users), então o PostgREST não embeda esse join sozinho — resolvemos
  // o nome manualmente a partir dos operadores já carregados.
  const nomePorOperadorId = new Map(operadores.map((op) => [op.id, op.nome ?? op.email]));
  const pagamentosHoje: PagamentoResumo[] = (pagamentosRaw ?? []).map((p) => ({
    id: p.id,
    tempo_min: p.tempo_min,
    valor: p.valor,
    forma_pagamento: p.forma_pagamento,
    status: p.status,
    operador_nome: nomePorOperadorId.get(p.operador_id) ?? null,
  }));

  return (
    <div className="flex flex-col pb-10">
      <PageHeader title="VoltCity KIDS" description="Brinquedos por tempo na praça: preços, operadores e pagamentos do dia." />

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="operadores">Operadores</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <ResumoKids pagamentosHoje={pagamentosHoje} />
        </TabsContent>

        <TabsContent value="precos">
          <PrecosKids precos={precos ?? []} />
        </TabsContent>

        <TabsContent value="operadores">
          <OperadoresKids operadores={operadores} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
