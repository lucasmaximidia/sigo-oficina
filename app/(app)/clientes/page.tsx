import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClienteFormDialog } from "@/components/clientes/cliente-form-dialog";
import { EquipamentoDialog } from "@/components/clientes/equipamento-dialog";
import { ExportarCsvButton } from "@/components/ui/exportar-csv-button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; q?: string }>;
}) {
  const params = await searchParams;

  const clientesQuery = supabase.from("clientes").select("id, nome, telefone, cpf_cnpj").order("nome", { ascending: true });
  const { data: clientes } = params.q
    ? await clientesQuery.ilike("nome", `%${params.q}%`)
    : await clientesQuery;

  const clienteId = params.id ?? clientes?.[0]?.id;

  let clienteDetalhe = null;
  let equipamentos: { id: string; tipo: string; marca: string | null; modelo: string | null; numero_serie: string | null; ultimaOs: number | null }[] = [];

  if (clienteId) {
    const { data: cliente } = await supabase.from("clientes").select("*").eq("id", clienteId).maybeSingle();
    clienteDetalhe = cliente;

    if (cliente) {
      const { data: equips } = await supabase
        .from("equipamentos")
        .select("id, tipo, marca, modelo, numero_serie")
        .eq("cliente_id", cliente.id)
        .order("created_at", { ascending: false });

      equipamentos = await Promise.all(
        (equips ?? []).map(async (equip) => {
          const { data: os } = await supabase
            .from("ordens_servico")
            .select("numero")
            .eq("equipamento_id", equip.id)
            .order("data_entrada", { ascending: false })
            .limit(1)
            .maybeSingle();
          return { ...equip, ultimaOs: os?.numero ?? null };
        })
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gerencie cadastros e visualize histórico de equipamentos."
        actions={
          <>
            <ExportarCsvButton tipo="clientes" />
            <ClienteFormDialog />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <Card className={cn("overflow-hidden p-0", clienteId && "hidden lg:block")}>
          <div className="border-b border-border p-3">
            <form action="/clientes" className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={params.q}
                placeholder="Buscar por nome ou CPF..."
                className="h-10 w-full rounded-xl border border-input bg-white pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </form>
          </div>
          <div className="flex max-h-[70vh] flex-col divide-y divide-border overflow-y-auto">
            {(clientes ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/clientes?id=${c.id}`}
                className={cn(
                  "flex items-center gap-3 p-3.5 transition-colors hover:bg-secondary/60",
                  c.id === clienteId && "bg-accent"
                )}
              >
                <Avatar>
                  <AvatarFallback>{iniciais(c.nome)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.telefone || c.cpf_cnpj || ""}</p>
                </div>
              </Link>
            ))}
            {(clientes ?? []).length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
            )}
          </div>
        </Card>

        <div className={cn(!clienteId && "hidden lg:block")}>
          {clienteDetalhe ? (
            <div className="flex flex-col gap-5">
              <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground lg:hidden">
                <ArrowLeft className="size-4" />
                Voltar
              </Link>

              <Card className="p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="text-base">{iniciais(clienteDetalhe.nome)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{clienteDetalhe.nome}</p>
                      <Badge variant={clienteDetalhe.ativo ? "success" : "secondary"}>
                        {clienteDetalhe.ativo ? "Cliente Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <ClienteFormDialog cliente={clienteDetalhe} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contato</p>
                    <p className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {clienteDetalhe.telefone || "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <Mail className="size-3.5 text-muted-foreground" />
                      {clienteDetalhe.email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Endereço</p>
                    <p className="flex items-start gap-2 text-sm text-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span>
                        {clienteDetalhe.endereco || "—"}
                        {clienteDetalhe.bairro ? ` · ${clienteDetalhe.bairro}` : ""}
                        {clienteDetalhe.cidade ? ` · ${clienteDetalhe.cidade}/${clienteDetalhe.estado ?? ""}` : ""}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">Equipamentos Vinculados</p>
                  <EquipamentoDialog clienteId={clienteDetalhe.id} />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {equipamentos.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum equipamento cadastrado.</p>
                  )}
                  {equipamentos.map((equip) => (
                    <div key={equip.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {equip.tipo} {equip.marca ? `· ${equip.marca}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {equip.modelo ? `Mod: ${equip.modelo}` : ""} {equip.numero_serie ? `· S/N: ${equip.numero_serie}` : ""}
                        </p>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {equip.ultimaOs ? `Último OS #OS-${String(equip.ultimaOs).padStart(4, "0")}` : "Sem histórico"}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="flex h-64 items-center justify-center p-6 text-sm text-muted-foreground">
              Cadastre o primeiro cliente para começar.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
