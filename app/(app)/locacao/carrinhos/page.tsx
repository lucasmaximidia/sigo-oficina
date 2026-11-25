import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CadastrarCarrinhoDialog } from "@/components/locacao/cadastrar-carrinho-dialog";
import { CarrinhoCard } from "@/components/locacao/carrinho-card";
import { SessoesHistorico } from "@/components/locacao/sessoes-historico";
import { ResumoDispositivos, type ResumoCarrinho, type ResumoPeriodo } from "@/components/locacao/resumo-dispositivos";
import { ConfigDispositivosForm } from "@/components/locacao/config-dispositivos-form";
import { FaturamentoCarrinhos } from "@/components/locacao/faturamento-carrinhos";
import { FinanceiroCarrinhos } from "@/components/locacao/financeiro-carrinhos";
import { RedesWifiCarrinhos } from "@/components/locacao/redes-wifi-carrinhos";
import { LimparDadosTeste } from "@/components/locacao/limpar-dados-teste";
import { hojeBR, agoraBR } from "@/lib/utils";
import type { LocacaoDispositivoComando, LocacaoVeiculo } from "@/types";

export const dynamic = "force-dynamic";

function periodoVazio(): ResumoPeriodo {
  return { porTipo: {}, totalQtd: 0, totalMinutos: 0 };
}

function acumular(periodo: ResumoPeriodo, cartaoTipo: string, minutos: number) {
  const atual = periodo.porTipo[cartaoTipo] ?? { qtd: 0, minutos: 0 };
  periodo.porTipo[cartaoTipo] = { qtd: atual.qtd + 1, minutos: atual.minutos + minutos };
  periodo.totalQtd += 1;
  periodo.totalMinutos += minutos;
}

export default async function LocacaoCarrinhosPage() {
  const supabase = await createClient();

  const [
    { data: dispositivos },
    { data: veiculosQuadriciclo },
    { data: sessoesRaw },
    { data: config },
    { data: faturamento },
    { data: diarias },
    { data: saidas },
    { data: comandosRaw },
    { data: redes },
  ] = await Promise.all([
    supabase
      .from("locacao_dispositivos")
      .select("*, locacao_veiculos(id, marca, modelo)")
      .order("numero_carrinho", { ascending: true }),
    supabase
      .from("locacao_veiculos")
      .select("id, marca, modelo")
      .eq("tipo", "quadriciclo")
      .order("marca", { ascending: true }),
    supabase
      .from("locacao_dispositivo_sessoes")
      .select("*, locacao_dispositivos(numero_carrinho)")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("locacao_dispositivo_config").select("*").eq("id", 1).single(),
    supabase.from("locacao_carrinhos_faturamento_diario").select("*").order("dia", { ascending: false }),
    supabase
      .from("locacao_despesas")
      .select("data, descricao, valor")
      .eq("categoria", "DIARIA CARRINHOS")
      .order("data", { ascending: false }),
    supabase
      .from("locacao_despesas")
      .select("id, data, descricao, valor")
      .eq("categoria", "CARRINHOS")
      .order("data", { ascending: false }),
    supabase
      .from("locacao_dispositivo_comandos")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(500),
    supabase.from("locacao_dispositivo_redes").select("*").order("ordem", { ascending: true }),
  ]);

  const veiculos = (veiculosQuadriciclo ?? []) as Pick<LocacaoVeiculo, "id" | "marca" | "modelo">[];

  const sessoes = (sessoesRaw ?? []).map((s) => {
    const dispositivo = s.locacao_dispositivos as unknown as { numero_carrinho: number } | null;
    return {
      id: s.id,
      numero_carrinho: dispositivo?.numero_carrinho ?? 0,
      cartao_tipo: s.cartao_tipo,
      iniciado_em: s.iniciado_em,
      finalizado_em: s.finalizado_em,
      minutos: s.minutos,
      minutos_liberados: s.minutos_liberados,
      motivo_termino: s.motivo_termino,
      quedas_energia: s.quedas_energia,
      qtd_15min: s.qtd_15min,
      qtd_5min: s.qtd_5min,
      valor: s.valor,
      created_at: s.created_at,
      entrada_id: s.entrada_id,
    };
  });

  const carrinhosOpcoes = (dispositivos ?? []).map((d) => ({ id: d.numero_carrinho, label: `Carrinho #${d.numero_carrinho}` }));
  const carrinhosPorId = (dispositivos ?? []).map((d) => ({ id: d.id, label: `Carrinho #${d.numero_carrinho}` }));

  const comandosPorDispositivo = new Map<string, LocacaoDispositivoComando[]>();
  for (const c of comandosRaw ?? []) {
    const lista = comandosPorDispositivo.get(c.dispositivo_id) ?? [];
    lista.push(c);
    comandosPorDispositivo.set(c.dispositivo_id, lista);
  }

  const ultimaAtualizacaoRedes = (redes ?? []).reduce<string | null>(
    (max, r) => (!max || r.updated_at > max ? r.updated_at : max),
    null
  );

  // Resumo do dia e do mês — agrupado pelo dia em que a sessão foi
  // sincronizada (created_at), já que o horário do próprio carrinho
  // (iniciado_em/finalizado_em) pode vir nulo quando o relógio não está
  // acertado.
  const hoje = hojeBR();
  const { ano, mes } = agoraBR();
  const prefixoMes = `${ano}-${String(mes).padStart(2, "0")}`;

  const resumoPorCarrinho = new Map<number, ResumoCarrinho>();
  for (const d of dispositivos ?? []) {
    resumoPorCarrinho.set(d.numero_carrinho, { numeroCarrinho: d.numero_carrinho, hoje: periodoVazio(), mes: periodoVazio() });
  }
  for (const s of sessoes) {
    const resumo = resumoPorCarrinho.get(s.numero_carrinho);
    if (!resumo) continue;
    const diaSessao = s.created_at.slice(0, 10);
    if (diaSessao === hoje) acumular(resumo.hoje, s.cartao_tipo, s.minutos);
    if (diaSessao.startsWith(prefixoMes)) acumular(resumo.mes, s.cartao_tipo, s.minutos);
  }
  const resumos = Array.from(resumoPorCarrinho.values());

  return (
    <div className="pb-10">
      <PageHeader
        title="Carrinhos"
        description="Controle de tempo dos quadriciclos (ESP32) — status, histórico e configuração da frota"
        actions={<CadastrarCarrinhoDialog veiculos={veiculos} />}
      />

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          {dispositivos && dispositivos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dispositivos.map((d) => (
                <CarrinhoCard
                  key={d.id}
                  dispositivo={d}
                  veiculo={d.locacao_veiculos as unknown as Pick<LocacaoVeiculo, "id" | "marca" | "modelo"> | null}
                  veiculosDisponiveis={veiculos}
                  horasManutencao={config?.horas_manutencao ?? 100}
                  frotaBateriaMinima={config?.bateria_minima ?? 22}
                  frotaBateriaAviso={config?.bateria_aviso ?? 23}
                  comandos={comandosPorDispositivo.get(d.id) ?? []}
                  ultimaAtualizacaoRedes={ultimaAtualizacaoRedes}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum carrinho cadastrado ainda.</p>
          )}
        </TabsContent>

        <TabsContent value="historico">
          <SessoesHistorico sessoes={sessoes} carrinhos={carrinhosOpcoes} />
        </TabsContent>

        <TabsContent value="resumo">
          <ResumoDispositivos resumos={resumos} />
        </TabsContent>

        <TabsContent value="faturamento">
          <FaturamentoCarrinhos linhas={faturamento ?? []} carrinhos={carrinhosPorId} />
        </TabsContent>

        <TabsContent value="financeiro">
          <FinanceiroCarrinhos linhas={faturamento ?? []} diarias={diarias ?? []} saidas={saidas ?? []} />
        </TabsContent>

        <TabsContent value="config">
          <div className="flex flex-col gap-4">
            {config && <ConfigDispositivosForm config={config} />}
            <RedesWifiCarrinhos redes={redes ?? []} />
            <LimparDadosTeste />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
