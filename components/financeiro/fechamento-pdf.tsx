import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatDate as formatDatePdf } from "@/lib/utils";
import type { Configuracao } from "@/types";

const cores = {
  primary: "#2542b8",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#dbe0e3",
  bgMuted: "#f2f4f6",
  success: "#1a7f37",
  destructive: "#c0392b",
  warning: "#b45309",
  warningBg: "#fef3e2",
  // Mesma ordem fixa de cores usada nos gráficos do app (--chart-1/2/3 em
  // app/globals.css) — mão de obra sempre azul, peça sempre laranja, frete
  // sempre verde.
  chartMaoObra: "#2a78d6",
  chartPeca: "#eb6834",
  chartFrete: "#1baf7a",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: cores.text, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: cores.primary,
  },
  empresaBloco: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 32, height: 32, objectFit: "contain" },
  empresaNome: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  tituloBloco: { alignItems: "flex-end" },
  titulo: { fontSize: 15, fontFamily: "Helvetica-Bold", color: cores.primary },
  periodo: { fontSize: 9, color: cores.muted, marginTop: 2, textTransform: "capitalize" },
  emissao: { fontSize: 8, color: cores.muted, marginTop: 1 },
  saldoCard: {
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 4,
    padding: 14,
    marginBottom: 16,
    backgroundColor: cores.bgMuted,
  },
  saldoLabel: { fontSize: 8, color: cores.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  saldoValor: { fontSize: 20, fontFamily: "Helvetica-Bold", color: cores.primary, marginTop: 4 },
  secaoTitulo: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: cores.text,
    marginBottom: 8,
    marginTop: 16,
  },
  tabela: { borderWidth: 1, borderColor: cores.border, borderRadius: 3 },
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: cores.border,
  },
  linhaPrimeira: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  linhaLabel: { fontSize: 9 },
  linhaValorPositivo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.success },
  linhaValorNegativo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.destructive },
  linhaValorNeutro: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.text },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderTopWidth: 1.5,
    borderTopColor: cores.primary,
    backgroundColor: cores.bgMuted,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  totalValor: { fontSize: 12, fontFamily: "Helvetica-Bold", color: cores.primary },
  detalheTitulo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.text, marginBottom: 6, marginTop: 12 },
  detalheHeaderRow: { flexDirection: "row", backgroundColor: cores.bgMuted, borderBottomWidth: 1, borderBottomColor: cores.border },
  detalheTh: { padding: 5, fontSize: 7, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase" },
  detalheRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: cores.border },
  detalheTd: { padding: 5, fontSize: 8 },
  cardDestaque: {
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 4,
    padding: 14,
    backgroundColor: cores.bgMuted,
  },
  barra: {
    flexDirection: "row",
    height: 22,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 12,
  },
  legendaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 2 },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendaSwatch: { width: 8, height: 8, borderRadius: 2 },
  legendaLabel: { fontSize: 8.5, color: cores.muted },
  legendaValor: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.text },
  romboBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    padding: 9,
    borderRadius: 4,
    backgroundColor: cores.warningBg,
  },
  romboLabel: { fontSize: 8.5, color: cores.warning },
  romboValor: { fontSize: 9, fontFamily: "Helvetica-Bold", color: cores.warning },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7,
    color: cores.muted,
  },
});

function formatCurrencyPdf(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercentPdf(value: number) {
  return `${value.toFixed(1)}%`;
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatMesAno(mes: string) {
  const [ano, mesNum] = mes.split("-").map(Number);
  return `${MESES[mesNum - 1]} de ${ano}`;
}

export interface FormaPagamentoResumo {
  forma: string;
  label: string;
  valor: number;
}

export interface ItemDetalhado {
  descricao: string;
  data: string;
  valor: number;
}

function DetalheTabela({ titulo, itens }: { titulo: string; itens: ItemDetalhado[] }) {
  if (itens.length === 0) return null;
  return (
    <>
      <Text style={styles.detalheTitulo}>{titulo}</Text>
      <View style={styles.tabela}>
        <View style={styles.detalheHeaderRow}>
          <Text style={[styles.detalheTh, { flex: 3 }]}>Descrição</Text>
          <Text style={[styles.detalheTh, { flex: 1 }]}>Data</Text>
          <Text style={[styles.detalheTh, { flex: 1, textAlign: "right" }]}>Valor</Text>
        </View>
        {itens.map((item, index) => (
          <View key={index} style={styles.detalheRow} wrap={false}>
            <Text style={[styles.detalheTd, { flex: 3 }]}>{item.descricao}</Text>
            <Text style={[styles.detalheTd, { flex: 1 }]}>{formatDatePdf(item.data)}</Text>
            <Text style={[styles.detalheTd, { flex: 1, textAlign: "right" }]}>{formatCurrencyPdf(item.valor)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export function FechamentoPdf({
  config,
  mes,
  saldoInicial,
  entradasMes,
  despesasMes,
  contasPagasMes,
  fretesPagosMes,
  retiradasMes,
  ajustesMes,
  saldoFinal,
  formasNoMes,
  entradasMaoObraMes,
  entradasPecasOficinaMes,
  custoPecasOficinaMes,
  lucroPecasOficinaMes,
  entradasPecasLojaMes,
  entradasFreteMes,
  custoFreteMes,
  lucroFreteMes,
  pctPecaDoLucroMes,
  pctFreteDoLucroMes,
  pctMaoObraDoLucroMes,
  despesaPagaPelaPecaMes,
  despesaPagaPelaFreteMes,
  despesaPagaPelaMaoObraMes,
  romboMes,
  detalheDespesas,
  detalheContas,
  detalheFretes,
  detalheRetiradas,
  detalheAjustes,
}: {
  config: Pick<Configuracao, "nome_empresa" | "logo_url">;
  mes: string;
  saldoInicial: number;
  entradasMes: number;
  despesasMes: number;
  contasPagasMes: number;
  fretesPagosMes: number;
  retiradasMes: number;
  ajustesMes: number;
  saldoFinal: number;
  formasNoMes: FormaPagamentoResumo[];
  entradasMaoObraMes: number;
  entradasPecasOficinaMes: number;
  custoPecasOficinaMes: number;
  lucroPecasOficinaMes: number;
  entradasPecasLojaMes: number;
  entradasFreteMes: number;
  custoFreteMes: number;
  lucroFreteMes: number;
  pctPecaDoLucroMes: number;
  pctFreteDoLucroMes: number;
  pctMaoObraDoLucroMes: number;
  despesaPagaPelaPecaMes: number;
  despesaPagaPelaFreteMes: number;
  despesaPagaPelaMaoObraMes: number;
  romboMes: number;
  detalheDespesas: ItemDetalhado[];
  detalheContas: ItemDetalhado[];
  detalheFretes: ItemDetalhado[];
  detalheRetiradas: ItemDetalhado[];
  detalheAjustes: ItemDetalhado[];
}) {
  const saidasMes = despesasMes + contasPagasMes + fretesPagosMes + retiradasMes;
  const dataEmissao = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());

  return (
    <Document title={`Fechamento-Mensal-${mes}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.empresaBloco}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
            {config.logo_url && <Image src={config.logo_url} style={styles.logo} />}
            <Text style={styles.empresaNome}>{config.nome_empresa}</Text>
          </View>
          <View style={styles.tituloBloco}>
            <Text style={styles.titulo}>Fechamento Mensal</Text>
            <Text style={styles.periodo}>{formatMesAno(mes)}</Text>
            <Text style={styles.emissao}>Emitido em {dataEmissao}</Text>
          </View>
        </View>

        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>Saldo Inicial (acumulado até o início do mês)</Text>
          <Text style={styles.saldoValor}>{formatCurrencyPdf(saldoInicial)}</Text>
        </View>

        <Text style={styles.secaoTitulo}>Movimentação do mês</Text>
        <View style={styles.tabela} wrap={false}>
          <View style={styles.linhaPrimeira}>
            <Text style={styles.linhaLabel}>Entradas (serviços + PDV)</Text>
            <Text style={styles.linhaValorPositivo}>+{formatCurrencyPdf(entradasMes)}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Despesas</Text>
            <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(despesasMes)}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Contas Pagas</Text>
            <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(contasPagasMes)}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Fretes Pagos</Text>
            <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(fretesPagosMes)}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Retiradas</Text>
            <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(retiradasMes)}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Ajustes de Caixa</Text>
            <Text style={ajustesMes >= 0 ? styles.linhaValorPositivo : styles.linhaValorNegativo}>
              {ajustesMes >= 0 ? "+" : "-"}
              {formatCurrencyPdf(Math.abs(ajustesMes))}
            </Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.linhaLabel}>Total de Saídas</Text>
            <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(saidasMes)}</Text>
          </View>
        </View>

        <View style={[styles.tabela, { marginTop: 16 }]} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Saldo Final</Text>
            <Text style={styles.totalValor}>{formatCurrencyPdf(saldoFinal)}</Text>
          </View>
        </View>

        {formasNoMes.length > 0 && (
          <View wrap={false}>
            <Text style={styles.secaoTitulo}>Recebimentos por Forma de Pagamento</Text>
            <View style={styles.tabela}>
              {formasNoMes.map((forma, index) => (
                <View key={forma.forma} style={index === 0 ? styles.linhaPrimeira : styles.linha}>
                  <Text style={styles.linhaLabel}>{forma.label}</Text>
                  <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(forma.valor)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View wrap={false}>
          <Text style={styles.secaoTitulo}>Composição das Entradas (Peça x Mão de Obra)</Text>
          <View style={styles.tabela}>
            <View style={styles.linhaPrimeira}>
              <Text style={styles.linhaLabel}>Mão de Obra</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(entradasMaoObraMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Peças (Oficina)</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(entradasPecasOficinaMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Custo das Peças (Oficina)</Text>
              <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(custoPecasOficinaMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Peças (Loja Parceira — repasse, sem margem)</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(entradasPecasLojaMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Frete</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(entradasFreteMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Custo do Frete</Text>
              <Text style={styles.linhaValorNegativo}>-{formatCurrencyPdf(custoFreteMes)}</Text>
            </View>
          </View>
          <View style={[styles.tabela, { marginTop: 8 }]}>
            <View style={styles.linhaPrimeira}>
              <Text style={styles.linhaLabel}>Lucro em Peças (Oficina) no mês</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(lucroPecasOficinaMes)}</Text>
            </View>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>Lucro em Frete no mês</Text>
              <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(lucroFreteMes)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Lucro Total da Oficina no mês</Text>
              <Text style={styles.totalValor}>{formatCurrencyPdf(lucroPecasOficinaMes + lucroFreteMes)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardDestaque, { marginTop: 16 }]} wrap={false}>
          <Text style={styles.saldoLabel}>Quem pagou as despesas do mês</Text>

          <View style={styles.barra}>
            <View style={{ flexGrow: Math.max(0, pctPecaDoLucroMes), backgroundColor: cores.chartPeca }} />
            <View style={{ flexGrow: Math.max(0, pctFreteDoLucroMes), backgroundColor: cores.chartFrete }} />
            <View style={{ flexGrow: Math.max(0, pctMaoObraDoLucroMes), backgroundColor: cores.chartMaoObra }} />
          </View>

          <View style={styles.legendaRow}>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaSwatch, { backgroundColor: cores.chartPeca }]} />
              <View>
                <Text style={styles.legendaLabel}>Lucro em Peças (Oficina)</Text>
                <Text style={styles.legendaValor}>
                  {formatCurrencyPdf(despesaPagaPelaPecaMes)} ({formatPercentPdf(pctPecaDoLucroMes)})
                </Text>
              </View>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaSwatch, { backgroundColor: cores.chartFrete }]} />
              <View>
                <Text style={styles.legendaLabel}>Lucro em Frete</Text>
                <Text style={styles.legendaValor}>
                  {formatCurrencyPdf(despesaPagaPelaFreteMes)} ({formatPercentPdf(pctFreteDoLucroMes)})
                </Text>
              </View>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaSwatch, { backgroundColor: cores.chartMaoObra }]} />
              <View>
                <Text style={styles.legendaLabel}>Mão de Obra</Text>
                <Text style={styles.legendaValor}>
                  {formatCurrencyPdf(despesaPagaPelaMaoObraMes)} ({formatPercentPdf(pctMaoObraDoLucroMes)})
                </Text>
              </View>
            </View>
          </View>

          {romboMes > 0.01 && (
            <View style={styles.romboBox}>
              <Text style={styles.romboLabel}>Rombo do mês (coberto por caixa/economia):</Text>
              <Text style={styles.romboValor}>{formatCurrencyPdf(romboMes)}</Text>
            </View>
          )}

          <Text style={[styles.emissao, { marginTop: 10 }]}>
            As despesas de {formatCurrencyPdf(saidasMes)} foram divididas nessa proporção a partir do lucro real do
            mês (peça + frete + mão de obra, já descontados os custos) — rateado pelo peso de cada fonte no lucro
            total. Peças de loja parceira não entram aqui por serem repassadas inteiras ao parceiro (margem zero pra
            oficina). O custo da peça usa o preço de custo atual dela, não o de quando foi vendida; o custo do frete
            segue o mesmo critério de mês usado no resto da página (mês em que o cliente pagou a OS, não em que o
            freteiro foi pago).
          </Text>
        </View>

        <DetalheTabela titulo="Despesas" itens={detalheDespesas} />
        <DetalheTabela titulo="Contas Pagas" itens={detalheContas} />
        <DetalheTabela titulo="Fretes Pagos" itens={detalheFretes} />
        <DetalheTabela titulo="Retiradas" itens={detalheRetiradas} />
        <DetalheTabela titulo="Ajustes de Caixa" itens={detalheAjustes} />

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Documento gerado automaticamente pelo SIGO Oficina para registro contábil do mês. · Página ${pageNumber} de ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
