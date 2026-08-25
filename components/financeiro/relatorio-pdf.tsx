import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { RELATORIO_COLUNAS, type RelatorioColuna } from "@/lib/relatorio-financeiro";
import type { Configuracao } from "@/types";

const cores = {
  primary: "#045d72",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#dbe0e3",
  bgMuted: "#f2f4f6",
};

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, color: cores.text, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: cores.primary,
  },
  empresaBloco: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 30, height: 30, objectFit: "contain" },
  empresaNome: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  tituloBloco: { alignItems: "flex-end" },
  titulo: { fontSize: 14, fontFamily: "Helvetica-Bold", color: cores.primary },
  periodo: { fontSize: 8, color: cores.muted, marginTop: 2 },
  filtro: { fontSize: 8, color: cores.muted, marginTop: 1 },
  table: { borderWidth: 1, borderColor: cores.border, borderRadius: 3 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: cores.primary },
  th: { padding: 5, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: cores.border },
  trAlt: { backgroundColor: cores.bgMuted },
  td: { padding: 5, fontSize: 7.5 },
  totalRow: { flexDirection: "row", borderTopWidth: 1.5, borderTopColor: cores.primary, backgroundColor: cores.bgMuted },
  totalCell: { padding: 5, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  resumoBloco: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  resumoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 4,
    padding: 10,
  },
  resumoLabel: { fontSize: 7, color: cores.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  resumoValor: { fontSize: 15, fontFamily: "Helvetica-Bold", color: cores.primary, marginTop: 3 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
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

export interface RelatorioLinha {
  id: string;
  cliente: string;
  produto: string;
  data_entrada: string;
  valor_pecas_loja: number;
  mao_obra: number;
  valor_pecas_oficina: number;
  frete_pago: number;
  frete_cobrado: number;
  pecas_loja_desc: string;
  pecas_oficina_desc: string;
  valor_total: number;
  valor_com_desconto: number;
  data_pagamento: string;
  forma_pagamento: string;
}

function celula(linha: RelatorioLinha, coluna: RelatorioColuna): string {
  const valor = linha[coluna.key as keyof RelatorioLinha];
  if (coluna.tipo === "moeda") return formatCurrencyPdf(Number(valor) || 0);
  if (coluna.tipo === "data") return valor ? formatDatePdf(String(valor)) : "—";
  return String(valor || "—");
}

export function RelatorioPdf({
  linhas,
  colunasSelecionadas,
  config,
  inicio,
  fim,
  mostrarResumo,
  lojaParceiraNome,
}: {
  linhas: RelatorioLinha[];
  colunasSelecionadas: string[];
  config: Pick<Configuracao, "nome_empresa" | "logo_url">;
  inicio: string;
  fim: string;
  mostrarResumo: boolean;
  lojaParceiraNome?: string | null;
}) {
  const colunas = RELATORIO_COLUNAS.filter((c) => colunasSelecionadas.includes(c.key));

  const totais: Record<string, number> = {};
  for (const coluna of colunas) {
    if (coluna.tipo === "moeda") {
      totais[coluna.key] = linhas.reduce((acc, l) => acc + (Number(l[coluna.key as keyof RelatorioLinha]) || 0), 0);
    }
  }

  const totalComDesconto = linhas.reduce((acc, l) => acc + l.valor_com_desconto, 0);
  const faturamentoOficina = linhas.reduce((acc, l) => acc + l.mao_obra + l.valor_pecas_oficina + l.frete_cobrado, 0);

  return (
    <Document title={`Relatorio-Financeiro-${inicio}-a-${fim}`}>
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.empresaBloco}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
            {config.logo_url && <Image src={config.logo_url} style={styles.logo} />}
            <Text style={styles.empresaNome}>{config.nome_empresa}</Text>
          </View>
          <View style={styles.tituloBloco}>
            <Text style={styles.titulo}>Relatório de Serviços Realizados</Text>
            <Text style={styles.periodo}>
              {formatDatePdf(inicio)} a {formatDatePdf(fim)} · {linhas.length} {linhas.length === 1 ? "OS" : "OS"}
            </Text>
            {lojaParceiraNome && <Text style={styles.filtro}>Loja parceira: {lojaParceiraNome}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            {colunas.map((coluna) => (
              <Text key={coluna.key} style={[styles.th, { flex: coluna.flex, textAlign: coluna.align ?? "left" }]}>
                {coluna.label}
              </Text>
            ))}
          </View>

          {linhas.map((linha, index) => (
            <View key={linha.id} style={[styles.tr, index % 2 === 1 ? styles.trAlt : {}]} wrap={false}>
              {colunas.map((coluna) => (
                <Text key={coluna.key} style={[styles.td, { flex: coluna.flex, textAlign: coluna.align ?? "left" }]}>
                  {celula(linha, coluna)}
                </Text>
              ))}
            </View>
          ))}

          {linhas.length === 0 && (
            <View style={styles.tr}>
              <Text style={styles.td}>Nenhuma OS finalizada nesse período.</Text>
            </View>
          )}

          {linhas.length > 0 && (
            <View style={styles.totalRow}>
              {colunas.map((coluna, i) => (
                <Text key={coluna.key} style={[styles.totalCell, { flex: coluna.flex, textAlign: coluna.align ?? "left" }]}>
                  {i === 0 ? "TOTAL" : coluna.key in totais ? formatCurrencyPdf(totais[coluna.key]) : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        {mostrarResumo && (
          <View style={styles.resumoBloco}>
            <View style={styles.resumoCard}>
              <Text style={styles.resumoLabel}>Total Recebido (com descontos)</Text>
              <Text style={styles.resumoValor}>{formatCurrencyPdf(totalComDesconto)}</Text>
            </View>
            <View style={styles.resumoCard}>
              <Text style={styles.resumoLabel}>Faturamento da Oficina (M.O. + Peças Oficina + Frete Cobrado)</Text>
              <Text style={styles.resumoValor}>{formatCurrencyPdf(faturamentoOficina)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </Page>
    </Document>
  );
}
