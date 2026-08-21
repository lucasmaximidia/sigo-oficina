import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Orcamento, OrcamentoItem, Configuracao } from "@/types";

const cores = {
  primary: "#00647c",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#e2e6ea",
  bgMuted: "#f2f4f6",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: cores.text,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: cores.primary,
  },
  empresaBloco: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 48, height: 48, objectFit: "contain" },
  empresaNome: { fontSize: 14, fontFamily: "Helvetica-Bold", color: cores.text },
  empresaInfo: { fontSize: 8, color: cores.muted, marginTop: 2 },
  tituloBloco: { alignItems: "flex-end" },
  titulo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: cores.primary },
  numero: { fontSize: 9, color: cores.muted, marginTop: 2 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: cores.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoCol: { flexDirection: "column", gap: 2 },
  infoLabel: { fontSize: 8, color: cores.muted },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 },
  table: { borderWidth: 1, borderColor: cores.border, borderRadius: 4, overflow: "hidden" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: cores.bgMuted,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: cores.border,
  },
  thDescricao: { flex: 3, fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase" },
  thQtd: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase", textAlign: "center" },
  thValor: { flex: 1.3, fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase", textAlign: "right" },
  tdDescricao: { flex: 3, fontSize: 9.5 },
  tdTipo: { fontSize: 7.5, color: cores.muted, marginTop: 1 },
  tdQtd: { flex: 1, fontSize: 9.5, textAlign: "center" },
  tdValor: { flex: 1.3, fontSize: 9.5, textAlign: "right" },
  totaisBloco: { alignItems: "flex-end", marginTop: 14 },
  totalLinha: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalLabel: { fontSize: 9, color: cores.muted },
  totalValor: { fontSize: 9, color: cores.text },
  totalGeralLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: cores.border,
  },
  totalGeralLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalGeralValor: { fontSize: 14, fontFamily: "Helvetica-Bold", color: cores.primary },
  aviso: {
    marginTop: 24,
    padding: 10,
    backgroundColor: cores.bgMuted,
    borderRadius: 4,
    fontSize: 8.5,
    color: cores.muted,
  },
  observacoes: { fontSize: 9, color: cores.text, lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: cores.muted,
    borderTopWidth: 1,
    borderTopColor: cores.border,
    paddingTop: 10,
  },
});

function formatCurrencyPdf(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDatePdf(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${value}T00:00:00`)
  );
}

export function OrcamentoPdf({
  orcamento,
  itens,
  config,
  clienteNome,
  clienteTelefone,
}: {
  orcamento: Orcamento;
  itens: OrcamentoItem[];
  config: Configuracao;
  clienteNome: string;
  clienteTelefone: string | null;
}) {
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade * i.valor_unitario, 0);
  const total = Math.max(0, totalItens - orcamento.desconto);

  return (
    <Document title={`Orcamento-${orcamento.numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.empresaBloco}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not an HTML img; no alt prop in its API */}
            {config.logo_url && <Image src={config.logo_url} style={styles.logo} />}
            <View>
              <Text style={styles.empresaNome}>{config.nome_empresa}</Text>
              {config.cnpj && <Text style={styles.empresaInfo}>CNPJ: {config.cnpj}</Text>}
              {config.telefone && <Text style={styles.empresaInfo}>{config.telefone}</Text>}
              {config.endereco && <Text style={styles.empresaInfo}>{config.endereco}</Text>}
            </View>
          </View>
          <View style={styles.tituloBloco}>
            <Text style={styles.titulo}>ORÇAMENTO</Text>
            <Text style={styles.numero}>#ORC-{String(orcamento.numero).padStart(4, "0")}</Text>
            <Text style={styles.numero}>Emitido em {formatDatePdf(orcamento.created_at.slice(0, 10))}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{clienteNome}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{clienteTelefone || "—"}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Válido até</Text>
              <Text style={styles.infoValue}>{formatDatePdf(orcamento.data_validade)}</Text>
            </View>
          </View>
        </View>

        {orcamento.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição do serviço</Text>
            <Text style={styles.observacoes}>{orcamento.descricao}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.thDescricao}>Descrição</Text>
              <Text style={styles.thQtd}>Qtd</Text>
              <Text style={styles.thValor}>Unitário</Text>
              <Text style={styles.thValor}>Total</Text>
            </View>
            {itens.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={styles.tdDescricao}>
                  <Text>{item.descricao}</Text>
                  <Text style={styles.tdTipo}>{item.tipo === "peca" ? "Peça" : "Mão de obra"}</Text>
                </View>
                <Text style={styles.tdQtd}>{item.quantidade}</Text>
                <Text style={styles.tdValor}>{formatCurrencyPdf(item.valor_unitario)}</Text>
                <Text style={styles.tdValor}>{formatCurrencyPdf(item.quantidade * item.valor_unitario)}</Text>
              </View>
            ))}
            {itens.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tdDescricao}>Nenhum item adicionado</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.totaisBloco}>
          <View style={styles.totalLinha}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValor}>{formatCurrencyPdf(totalItens)}</Text>
          </View>
          <View style={styles.totalLinha}>
            <Text style={styles.totalLabel}>Desconto</Text>
            <Text style={styles.totalValor}>- {formatCurrencyPdf(orcamento.desconto)}</Text>
          </View>
          <View style={styles.totalGeralLinha}>
            <Text style={styles.totalGeralLabel}>Total</Text>
            <Text style={styles.totalGeralValor}>{formatCurrencyPdf(total)}</Text>
          </View>
        </View>

        {orcamento.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observacoes}>{orcamento.observacoes}</Text>
          </View>
        )}

        <Text style={styles.aviso}>
          Este orçamento é válido até {formatDatePdf(orcamento.data_validade)}. Valores sujeitos a alteração após essa
          data. O início do serviço está condicionado à aprovação deste orçamento pelo cliente.
        </Text>

        <Text style={styles.footer}>
          {config.nome_empresa}
          {config.telefone ? ` · ${config.telefone}` : ""}
          {config.endereco ? ` · ${config.endereco}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
