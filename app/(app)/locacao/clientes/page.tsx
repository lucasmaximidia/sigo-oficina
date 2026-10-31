import { Phone, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { WhatsappButton } from "@/components/ui/whatsapp-button";
import { ClienteLocacaoDialog } from "@/components/locacao/cliente-locacao-dialog";

export const dynamic = "force-dynamic";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function LocacaoClientesPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: alugueis }] = await Promise.all([
    supabase.from("locacao_clientes").select("*").order("nome", { ascending: true }),
    supabase.from("locacao_alugueis").select("cliente_id, data_devolucao_real"),
  ]);

  const emAbertoPorCliente = new Set((alugueis ?? []).filter((a) => !a.data_devolucao_real).map((a) => a.cliente_id));
  const totalPorCliente = new Map<string, number>();
  for (const a of alugueis ?? []) {
    totalPorCliente.set(a.cliente_id, (totalPorCliente.get(a.cliente_id) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Clientes da Locação"
        description="Cadastro de clientes de scooters, bicicletas e quadriciclos elétricos"
        actions={<ClienteLocacaoDialog />}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(clientes ?? []).map((cliente) => (
          <Card key={cliente.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{iniciais(cliente.nome)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{cliente.nome}</p>
                  {cliente.cpf && <p className="truncate text-xs text-muted-foreground">{cliente.cpf}</p>}
                </div>
              </div>
              <ClienteLocacaoDialog cliente={cliente} />
            </div>

            {cliente.telefone && (
              <p className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="size-3.5 text-muted-foreground" />
                {cliente.telefone}
                <WhatsappButton telefone={cliente.telefone} />
              </p>
            )}

            <div className="flex items-center gap-2">
              {emAbertoPorCliente.has(cliente.id) && <Badge variant="info">Com veículo agora</Badge>}
              <Badge variant="secondary">
                {totalPorCliente.get(cliente.id) ?? 0} aluguel(éis)
              </Badge>
            </div>

            {cliente.observacoes && <p className="text-xs text-muted-foreground">{cliente.observacoes}</p>}
          </Card>
        ))}
      </div>

      {(clientes ?? []).length === 0 && (
        <EmptyState icon={<Users className="size-5" />} title="Nenhum cliente cadastrado ainda" />
      )}
    </div>
  );
}
