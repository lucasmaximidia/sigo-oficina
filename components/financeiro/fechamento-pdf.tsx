import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Configuracao } from "@/types";

const cores = {
  primary: "#2542b8",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#dbe0e3",
  bgMuted: "#f2f4f6",
  success: "#1a7f37",
  destructive: "#c0392b",
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

function formatDatePdf(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
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
        <View style={styles.tabela}>
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

        <View style={[styles.tabela, { marginTop: 16 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Saldo Final</Text>
            <Text style={styles.totalValor}>{formatCurrencyPdf(saldoFinal)}</Text>
          </View>
        </View>

        {formasNoMes.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Recebimentos por Forma de Pagamento</Text>
            <View style={styles.tabela}>
              {formasNoMes.map((forma, index) => (
                <View key={forma.forma} style={index === 0 ? styles.linhaPrimeira : styles.linha}>
                  <Text style={styles.linhaLabel}>{forma.label}</Text>
                  <Text style={styles.linhaValorNeutro}>{formatCurrencyPdf(forma.valor)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

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
