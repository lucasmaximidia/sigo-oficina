import Link from "next/link";
import { cookies } from "next/headers";
import { Plus, ChevronRight, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { OsStatusTabs } from "@/components/os/status-tabs";
import { OsTableRow } from "@/components/os/os-table-row";
import { OsKanbanBoard, type OsKanbanItem } from "@/components/os/os-kanban-board";
import { OsViewToggle } from "@/components/os/os-view-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
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
  empresas_autorizadas: { nome: string } | null;
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
  searchParams: Promise<{ status?: string; page?: string; view?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const status = params.status as OsStatus | undefined;
  const busca = params.q?.trim();
  const page = Math.max(1, Number(params.page ?? "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const cookieStore = await cookies();
  const viewPreferida = cookieStore.get("sigo-os-view")?.value;
  const view = params.view === "kanban" || (!params.view && viewPreferida === "kanban") ? "kanban" : "lista";

  const viewToggle = <OsViewToggle view={view} />;

  if (view === "kanban") {
    const colunasKanban =
      "id, numero, status, urgencia, valor_mao_obra, valor_frete, desconto, data_entrada, data_finalizacao, data_retirada, clientes(nome), equipamentos(tipo, marca, modelo), os_itens(quantidade, valor_unitario)";
    const limiteFinalizadas = new Date();
    limiteFinalizadas.setDate(limiteFinalizadas.getDate() - 30);

    const [{ data: ordensAtivas }, { data: ordensFinalizadas }] = await Promise.all([
      supabase
        .from("ordens_servico")
        .select<string, OsKanbanRow>(colunasKanban)
        .not("status", "in", "(cancelado,finalizado)")
        .order("data_entrada", { ascending: false })
        .limit(200),
      // Só as finalizadas dos últimos 30 dias — o histórico completo fica na visão Lista,
      // pra essa coluna não crescer pra sempre e virar rolagem infinita.
      supabase
        .from("ordens_servico")
        .select<string, OsKanbanRow>(colunasKanban)
        .eq("status", "finalizado")
        .gte("data_finalizacao", limiteFinalizadas.toISOString().slice(0, 10))
        .order("data_finalizacao", { ascending: false })
        .limit(200),
    ]);
    const ordensKanban = [...(ordensAtivas ?? []), ...(ordensFinalizadas ?? [])];

    const itensKanban: OsKanbanItem[] = ordensKanban.map((os) => {
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
      <div className="flex h-full flex-col">
        <PageHeader
          title="Ordens de Serviço"
          description="Arraste os cards entre as colunas para mudar o status. Finalizadas há mais de 30 dias saem daqui — veja o histórico completo na Lista."
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
        <div className="min-h-0 flex-1">
          <OsKanbanBoard ordens={itensKanban} />
        </div>
      </div>
    );
  }

  let query = supabase
    .from("ordens_servico")
    .select<string, OsListRow>(
      "id, numero, status, urgencia, data_entrada, clientes(nome, telefone), equipamentos(tipo, marca, modelo), empresas_autorizadas(nome)",
      { count: "exact" }
    )
    .order("data_entrada", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);

  if (busca) {
    const numeroBusca = Number(busca.replace(/\D/g, ""));
    const [{ data: clientesEncontrados }, { data: empresasEncontradas }] = await Promise.all([
      supabase.from("clientes").select("id").ilike("nome", `%${busca}%`),
      supabase.from("empresas_autorizadas").select("id").ilike("nome", `%${busca}%`),
    ]);
    const clienteIds = (clientesEncontrados ?? []).map((c) => c.id);
    const empresaIds = (empresasEncontradas ?? []).map((e) => e.id);

    const condicoes: string[] = [];
    if (clienteIds.length > 0) condicoes.push(`cliente_id.in.(${clienteIds.join(",")})`);
    if (empresaIds.length > 0) condicoes.push(`empresa_autorizada_id.in.(${empresaIds.join(",")})`);
    if (Number.isFinite(numeroBusca) && numeroBusca > 0) condicoes.push(`numero.eq.${numeroBusca}`);

    query = condicoes.length > 0 ? query.or(condicoes.join(",")) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <OsStatusTabs active={status ?? "todos"} />
        <form action="/ordens-servico" className="relative w-full sm:w-64">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={busca}
            placeholder="Buscar por cliente ou nº da OS..."
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </form>
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {os.empresas_autorizadas && <Badge variant="info">{os.empresas_autorizadas.nome}</Badge>}
                      </div>
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
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      {os.empresas_autorizadas && <Badge variant="info">{os.empresas_autorizadas.nome}</Badge>}
                    </div>
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
                <Link href={buildPageHref(status, busca, page - 1)}>Anterior</Link>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((p) => (
                  <Button key={p} asChild variant={p === page ? "default" : "outline"} size="sm">
                    <Link href={buildPageHref(status, busca, p)}>{p}</Link>
                  </Button>
                ))}
              <Button
                asChild
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              >
                <Link href={buildPageHref(status, busca, page + 1)}>Próxima</Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function buildPageHref(status: string | undefined, busca: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (busca) params.set("q", busca);
  params.set("page", String(page));
  return `/ordens-servico?${params.toString()}`;
}
