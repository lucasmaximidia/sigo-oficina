import { Document, Page, View, Text, Image, Svg, Circle, Path, StyleSheet } from "@react-pdf/renderer";
import type { Configuracao } from "@/types";

const cores = {
  primary: "#2542b8",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#e2e6ea",
  bgMuted: "#f2f4f6",
};

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontSize: 10,
    color: cores.text,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: cores.primary,
  },
  empresaBloco: { flexDirection: "row", alignItems: "center", gap: 10, width: 300 },
  logo: { width: 48, height: 48, objectFit: "contain" },
  empresaTextos: { width: 230 },
  empresaNome: { fontSize: 14, fontFamily: "Helvetica-Bold", color: cores.text },
  empresaInfo: { fontSize: 8, color: cores.muted, marginTop: 2 },
  tituloBloco: { alignItems: "flex-end", width: 200 },
  tituloRodape: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  tituloTexto: { alignItems: "flex-end" },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold", color: cores.primary, textAlign: "right" },
  numero: { fontSize: 9, color: cores.muted, marginTop: 2 },
  section: { marginBottom: 10 },
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
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: cores.border,
  },
  thDescricao: { flex: 3, fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase" },
  thQtd: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: cores.muted, textTransform: "uppercase", textAlign: "center" },
  tdDescricao: { flex: 3, fontSize: 9.5 },
  tdQtd: { flex: 1, fontSize: 9.5, textAlign: "center" },
  destaqueBloco: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: cores.bgMuted,
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  destaqueItem: { alignItems: "center" },
  destaqueValor: { fontSize: 11, fontFamily: "Helvetica-Bold", color: cores.primary },
  destaqueLabel: { fontSize: 7, color: cores.muted, marginTop: 1, textTransform: "uppercase", letterSpacing: 0.5 },
  aviso: {
    padding: 8,
    backgroundColor: cores.bgMuted,
    borderRadius: 4,
    fontSize: 8,
    color: cores.muted,
    lineHeight: 1.35,
  },
  rodapeAcoes: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 },
  assinaturaLinha: { width: 200, borderTopWidth: 1, borderTopColor: cores.border, paddingTop: 4 },
  assinaturaLabel: { fontSize: 8, color: cores.muted, textAlign: "center" },
  qrWrap: { alignItems: "center" },
  qrImg: { width: 50, height: 50 },
  qrCaption: { fontSize: 6, color: cores.muted, marginTop: 3, width: 70, textAlign: "center" },
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

function formatDatePdf(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function SeloGarantia() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44">
      <Circle cx="22" cy="22" r="21" fill={cores.primary} />
      <Circle cx="22" cy="22" r="21" fill="none" stroke="#ffffff" strokeWidth="1" />
      <Circle cx="22" cy="22" r="17" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
      <Path d="M14 22.5 L19.5 28 L30 16" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CertificadoPdf({
  numero,
  clienteNome,
  clienteTelefone,
  equipamentoDescricao,
  numeroSerie,
  problemaRelatado,
  itens,
  maoObraItens,
  dataInicio,
  dataExpiracao,
  garantiaDias,
  config,
  qrCodeDataUrl,
}: {
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  equipamentoDescricao: string;
  numeroSerie: string | null;
  problemaRelatado: string | null;
  itens: { id: string; descricao: string; quantidade: number }[];
  maoObraItens: { id: string; descricao: string }[];
  dataInicio: string;
  dataExpiracao: string;
  garantiaDias: number;
  config: Configuracao;
  qrCodeDataUrl: string | null;
}) {
  const textoBase =
    config.garantia_texto_padrao ||
    `Esta garantia refere-se exclusivamente ao serviço executado e à(s) peça(s) listada(s) acima, nesta ordem de serviço. O prazo de validade é o indicado acima, contado a partir da data de entrega do equipamento ao cliente, conforme determinação legal (CDC, art. 26, II). Cobertura: {TIPO_COBERTURA}. Esta garantia não cobre danos causados por mau uso, quedas, líquidos, oscilação de energia ou intervenção de terceiros não autorizados.`;

  const texto = textoBase.replace(/\{TIPO_COBERTURA\}/g, config.garantia_tipo_cobertura);

  return (
    <Document title={`Certificado-Garantia-${numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.empresaBloco}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
            {config.logo_url && <Image src={config.logo_url} style={styles.logo} />}
            <View style={styles.empresaTextos}>
              <Text style={styles.empresaNome}>{config.nome_empresa}</Text>
              {config.cnpj && <Text style={styles.empresaInfo}>CNPJ: {config.cnpj}</Text>}
              {config.telefone && <Text style={styles.empresaInfo}>{config.telefone}</Text>}
              {config.endereco && <Text style={styles.empresaInfo}>{config.endereco}</Text>}
            </View>
          </View>
          <View style={styles.tituloBloco}>
            <Text style={styles.titulo}>CERTIFICADO DE GARANTIA</Text>
            <View style={styles.tituloRodape}>
              <View style={styles.tituloTexto}>
                <Text style={styles.numero}>OS #OS-{String(numero).padStart(4, "0")}</Text>
                <Text style={styles.numero}>Emitido em {formatDatePdf(dataInicio)}</Text>
              </View>
              <SeloGarantia />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente e Equipamento</Text>
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
              <Text style={styles.infoLabel}>Equipamento</Text>
              <Text style={styles.infoValue}>{equipamentoDescricao}</Text>
            </View>
            {numeroSerie && (
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Nº de série</Text>
                <Text style={styles.infoValue}>{numeroSerie}</Text>
              </View>
            )}
          </View>
          {problemaRelatado && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.infoLabel}>Defeito relatado</Text>
              <Text style={[styles.infoValue, { marginTop: 1 }]}>{problemaRelatado}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peças e Materiais Utilizados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.thDescricao}>Descrição</Text>
              <Text style={styles.thQtd}>Qtd</Text>
            </View>
            {itens.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tdDescricao}>{item.descricao}</Text>
                <Text style={styles.tdQtd}>{item.quantidade}</Text>
              </View>
            ))}
            {itens.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tdDescricao}>Nenhuma peça registrada nesta OS</Text>
              </View>
            )}
          </View>
        </View>

        {maoObraItens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mão de Obra Realizada</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.thDescricao}>Descrição</Text>
              </View>
              {maoObraItens.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.tdDescricao}>{item.descricao}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.destaqueBloco}>
          <View style={styles.destaqueItem}>
            <Text style={styles.destaqueValor}>{formatDatePdf(dataInicio)}</Text>
            <Text style={styles.destaqueLabel}>Início da garantia</Text>
          </View>
          <View style={styles.destaqueItem}>
            <Text style={styles.destaqueValor}>{garantiaDias} dias</Text>
            <Text style={styles.destaqueLabel}>Prazo</Text>
          </View>
          <View style={styles.destaqueItem}>
            <Text style={styles.destaqueValor}>{formatDatePdf(dataExpiracao)}</Text>
            <Text style={styles.destaqueLabel}>Válido até</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termo de Garantia</Text>
          <Text style={styles.aviso}>{texto}</Text>
        </View>

        <View style={styles.rodapeAcoes}>
          {config.garantia_assinatura_digital ? (
            <View style={styles.assinaturaLinha}>
              <Text style={styles.assinaturaLabel}>Assinatura do Técnico Responsável</Text>
            </View>
          ) : (
            <View />
          )}
          {config.garantia_qrcode && qrCodeDataUrl && (
            <View style={styles.qrWrap}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
              <Image src={qrCodeDataUrl} style={styles.qrImg} />
              <Text style={styles.qrCaption}>Escaneie para verificar a autenticidade</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          {config.nome_empresa}
          {config.telefone ? ` · ${config.telefone}` : ""}
          {config.endereco ? ` · ${config.endereco}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
