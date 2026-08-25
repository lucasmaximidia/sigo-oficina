import Link from "next/link";
import { Plus, ChevronRight, List, LayoutGrid } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/layout/page-header";
import { OsStatusTabs } from "@/components/os/status-tabs";
import { OsTableRow } from "@/components/os/os-table-row";
import { OsKanbanBoard, type OsKanbanItem } from "@/components/os/os-kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import { osStatusMap, urgenciaMap } from "@/lib/status";
import type { OsStatus, OsUrgencia } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

interface OsListRow {
  id: string;
  numero: number;
  status: OsStatus;
  urgencia: OsUrgencia;
  data_entrada: string;
  clientes: { nome: string; telefone: string | null } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null } | null;
}

interface OsKanbanRow {
  id: string;
  numero: number;
  status: OsStatus;
  urgencia: OsUrgencia;
  valor_mao_obra: number;
  valor_frete: number;
  desconto: number;
  data_entrada: string;
  data_finalizacao: string | null;
  data_retirada: string | null;
  clientes: { nome: string } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null } | null;
  os_itens: { quantidade: number; valor_unitario: number }[];
}

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const status = params.status as OsStatus | undefined;
  const page = Math.max(1, Number(params.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const view = params.view === "kanban" ? "kanban" : "lista";

  const viewToggle = (
    <div className="flex shrink-0 rounded-xl bg-muted p-1">
      <Link
        href="/ordens-servico"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "lista" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="size-4" />
        Lista
      </Link>
      <Link
        href="/ordens-servico?view=kanban"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "kanban" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-4" />
        Kanban
      </Link>
    </div>
  );

  if (view === "kanban") {
    const { data: ordensKanban } = await supabase
      .from("ordens_servico")
      .select<string, OsKanbanRow>(
        "id, numero, status, urgencia, valor_mao_obra, valor_frete, desconto, data_entrada, data_finalizacao, data_retirada, clientes(nome), equipamentos(tipo, marca, modelo), os_itens(quantidade, valor_unitario)"
      )
      .neq("status", "cancelado")
      .order("data_entrada", { ascending: false })
      .limit(200);

    const itensKanban: OsKanbanItem[] = (ordensKanban ?? []).map((os) => {
      const totalItens = (os.os_itens ?? []).reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
      const total = totalItens + os.valor_mao_obra + os.valor_frete - os.desconto;
      const equipamento = os.equipamentos;
      const dataLabel =
        os.status === "finalizado"
          ? `Finalizado ${formatDate(os.data_retirada ?? os.data_finalizacao ?? os.data_entrada)}`
          : `Entrada ${formatDate(os.data_entrada)}`;
      return {
        id: os.id,
        numero: os.numero,
        status: os.status,
        urgencia: os.urgencia,
        total,
        clienteNome: os.clientes?.nome ?? "—",
        equipamentoDescricao: equipamento
          ? [equipamento.marca, equipamento.modelo].filter(Boolean).join(" ") || equipamento.tipo
          : "—",
        dataLabel,
      };
    });

    return (
      <div>
        <PageHeader
          title="Ordens de Serviço"
          description="Arraste os cards entre as colunas para mudar o status."
          actions={
            <>
              {viewToggle}
              <Button asChild variant="secondary">
                <Link href="/agenda?novo=1">Novo Agendamento</Link>
              </Button>
              <Button asChild>
                <Link href="/ordens-servico/nova">
                  <Plus className="size-4" />
                  Nova OS
                </Link>
              </Button>
            </>
          }
        />
        <OsKanbanBoard ordens={itensKanban} />
      </div>
    );
  }

  let query = supabase
    .from("ordens_servico")
    .select<string, OsListRow>(
      "id, numero, status, urgencia, data_entrada, clientes(nome, telefone), equipamentos(tipo, marca, modelo)",
      { count: "exact" }
    )
    .order("data_entrada", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  const { data: ordens, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie e acompanhe o status de todas as manutenções."
        actions={
          <>
            {viewToggle}
            <Button asChild variant="secondary">
              <Link href="/agenda?novo=1">Novo Agendamento</Link>
            </Button>
            <Button asChild>
              <Link href="/ordens-servico/nova">
                <Plus className="size-4" />
                Nova OS
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <OsStatusTabs active={status ?? "todos"} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Entrada</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ordens ?? []).map((os) => {
                const cliente = Array.isArray(os.clientes) ? os.clientes[0] : os.clientes;
                const equipamento = Array.isArray(os.equipamentos) ? os.equipamentos[0] : os.equipamentos;
                const urgencia = urgenciaMap[os.urgencia as OsUrgencia];
                const statusInfo = osStatusMap[os.status as OsStatus];
                return (
                  <OsTableRow key={os.id} href={`/ordens-servico/${os.id}`}>
                    <TableCell>
                      <span className={`inline-block size-2.5 rounded-full ${urgencia.dotClass}`} />
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      #OS-{String(os.numero).padStart(4, "0")}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{cliente?.nome ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{cliente?.telefone ?? ""}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{equipamento?.tipo ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[equipamento?.marca, equipamento?.modelo].filter(Boolean).join(" ")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(os.data_entrada)}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </OsTableRow>
                );
              })}
              {(ordens ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col divide-y divide-border md:hidden">
          {(ordens ?? []).map((os) => {
            const cliente = Array.isArray(os.clientes) ? os.clientes[0] : os.clientes;
            const equipamento = Array.isArray(os.equipamentos) ? os.equipamentos[0] : os.equipamentos;
            const urgencia = urgenciaMap[os.urgencia as OsUrgencia];
            const statusInfo = osStatusMap[os.status as OsStatus];
            return (
              <Link key={os.id} href={`/ordens-servico/${os.id}`} className="flex items-start gap-3 p-4 active:bg-secondary/50">
                <span className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-full ${urgencia.dotClass}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-primary">#OS-{String(os.numero).padStart(4, "0")}</p>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">{cliente?.nome ?? "—"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {equipamento?.tipo} {[equipamento?.marca, equipamento?.modelo].filter(Boolean).join(" ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(os.data_entrada)}</p>
                </div>
              </Link>
            );
          })}
          {(ordens ?? []).length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma ordem de serviço encontrada.</p>
          )}
        </div>

        {total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Mostrando {from + 1} a {Math.min(to + 1, total)} de {total} registros
            </p>
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={buildPageHref(status, page - 1)}>Anterior</Link>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((p) => (
                  <Button key={p} asChild variant={p === page ? "default" : "outline"} size="sm">
                    <Link href={buildPageHref(status, p)}>{p}</Link>
                  </Button>
                ))}
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={buildPageHref(status, page + 1)}>Próxima</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function buildPageHref(status: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  return `/ordens-servico?${params.toString()}`;
}
