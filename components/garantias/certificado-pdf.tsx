import { Document, Page, View, Text, Image, Svg, Circle, Path, StyleSheet } from "@react-pdf/renderer";
import type { Configuracao } from "@/types";

const cores = {
  primary: "#00647c",
  selo: "#b45309",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#e2e6ea",
  bgMuted: "#f7f9fb",
};

const styles = StyleSheet.create({
  page: { padding: 18, fontFamily: "Helvetica", color: cores.text },
  moldura: {
    flex: 1,
    borderWidth: 2,
    borderColor: cores.primary,
    padding: 6,
  },
  molduraInterna: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.selo,
    padding: 30,
  },
  header: { alignItems: "center", marginBottom: 4 },
  empresaBloco: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  logo: { width: 40, height: 40, objectFit: "contain" },
  empresaNome: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  empresaInfo: { fontSize: 7.5, color: cores.muted, marginTop: 1 },
  tituloWrap: { alignItems: "center", marginTop: 4, marginBottom: 4 },
  eyebrow: { fontSize: 8, color: cores.selo, letterSpacing: 2, fontFamily: "Helvetica-Bold" },
  titulo: { fontSize: 22, fontFamily: "Helvetica-Bold", color: cores.primary, marginTop: 4 },
  linhaTitulo: { width: 90, height: 2, backgroundColor: cores.selo, marginTop: 10, marginBottom: 22 },

  seloWrap: {
    position: "absolute",
    top: 24,
    right: 24,
    alignItems: "center",
    transform: "rotate(-9deg)",
  },
  seloCaption: { fontSize: 7, fontFamily: "Helvetica-Bold", color: cores.selo, marginTop: 3, letterSpacing: 0.5 },
  seloCaptionSub: { fontSize: 6.5, color: cores.selo, marginTop: 1 },

  corpo: { flexDirection: "row", gap: 24, marginBottom: 22 },
  coluna: { flex: 1, gap: 14 },
  campo: { gap: 2 },
  campoLabel: { fontSize: 7.5, color: cores.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  campoValor: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  destaqueBloco: {
    backgroundColor: cores.bgMuted,
    borderRadius: 4,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 22,
  },
  destaqueItem: { alignItems: "center" },
  destaqueValor: { fontSize: 16, fontFamily: "Helvetica-Bold", color: cores.primary },
  destaqueLabel: { fontSize: 7.5, color: cores.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  textoLegal: { fontSize: 9, lineHeight: 1.6, color: cores.text, textAlign: "justify", marginBottom: 24 },

  rodapeBloco: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" },
  assinaturaLinha: { width: 200, borderTopWidth: 1, borderTopColor: cores.text, paddingTop: 4 },
  assinaturaLabel: { fontSize: 8, color: cores.muted, textAlign: "center" },
  qrWrap: { alignItems: "center" },
  qrImg: { width: 54, height: 54 },
  qrCaption: { fontSize: 6, color: cores.muted, marginTop: 3, width: 70, textAlign: "center" },

  footer: { textAlign: "center", fontSize: 7, color: cores.muted, marginTop: 16 },
});

function formatDatePdf(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function SeloGarantia({ dias }: { dias: number }) {
  return (
    <View style={styles.seloWrap}>
      <Svg width={78} height={78} viewBox="0 0 78 78">
        <Circle cx="39" cy="39" r="37" fill={cores.selo} />
        <Circle cx="39" cy="39" r="37" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        <Circle cx="39" cy="39" r="30" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="2,2.5" />
        <Path
          d="M25 40 L34 49 L54 27"
          stroke="#ffffff"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.seloCaption}>GARANTIA</Text>
      <Text style={styles.seloCaptionSub}>{dias} DIAS</Text>
    </View>
  );
}

export function CertificadoPdf({
  numero,
  clienteNome,
  equipamentoDescricao,
  numeroSerie,
  dataInicio,
  dataExpiracao,
  garantiaDias,
  config,
  qrCodeDataUrl,
}: {
  numero: number;
  clienteNome: string;
  equipamentoDescricao: string;
  numeroSerie: string | null;
  dataInicio: string;
  dataExpiracao: string;
  garantiaDias: number;
  config: Configuracao;
  qrCodeDataUrl: string | null;
}) {
  const textoBase =
    config.garantia_texto_padrao ||
    `A {EMPRESA_NOME} assegura ao cliente a garantia sobre os serviços prestados e peças substituídas, conforme as seguintes condições: 1. PRAZO: o prazo de validade desta garantia é de {PRAZO_DIAS} dias, contados a partir da data de entrega do equipamento ao cliente, conforme determinação legal (CDC, art. 26, II). 2. COBERTURA: {TIPO_COBERTURA}. Esta garantia não cobre danos causados por mau uso, quedas, líquidos, oscilação de energia ou intervenção de terceiros não autorizados.`;

  const texto = textoBase
    .replace(/\{CLIENTE_NOME\}/g, clienteNome)
    .replace(/\{EQUIPAMENTO\}/g, equipamentoDescricao)
    .replace(/\{PRAZO_DIAS\}/g, String(garantiaDias))
    .replace(/\{DATA_SERVICO\}/g, formatDatePdf(dataInicio))
    .replace(/\{EMPRESA_NOME\}/g, config.nome_empresa)
    .replace(/\{TIPO_COBERTURA\}/g, config.garantia_tipo_cobertura);

  return (
    <Document title={`Certificado-Garantia-${numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.moldura}>
          <View style={styles.molduraInterna}>
            <SeloGarantia dias={garantiaDias} />

            <View style={styles.header}>
              <View style={styles.empresaBloco}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
                {config.logo_url && <Image src={config.logo_url} style={styles.logo} />}
                <View>
                  <Text style={styles.empresaNome}>{config.nome_empresa}</Text>
                  {config.cnpj && <Text style={styles.empresaInfo}>CNPJ: {config.cnpj}</Text>}
                  {config.telefone && <Text style={styles.empresaInfo}>{config.telefone}</Text>}
                </View>
              </View>
              <View style={styles.tituloWrap}>
                <Text style={styles.eyebrow}>DOCUMENTO OFICIAL</Text>
                <Text style={styles.titulo}>CERTIFICADO DE GARANTIA</Text>
                <View style={styles.linhaTitulo} />
              </View>
            </View>

            <View style={styles.corpo}>
              <View style={styles.coluna}>
                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Cliente</Text>
                  <Text style={styles.campoValor}>{clienteNome}</Text>
                </View>
                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Equipamento</Text>
                  <Text style={styles.campoValor}>{equipamentoDescricao}</Text>
                </View>
                {numeroSerie && (
                  <View style={styles.campo}>
                    <Text style={styles.campoLabel}>Número de série</Text>
                    <Text style={styles.campoValor}>{numeroSerie}</Text>
                  </View>
                )}
              </View>
              <View style={styles.coluna}>
                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Ordem de serviço</Text>
                  <Text style={styles.campoValor}>#OS-{String(numero).padStart(4, "0")}</Text>
                </View>
                <View style={styles.campo}>
                  <Text style={styles.campoLabel}>Tipo de cobertura</Text>
                  <Text style={styles.campoValor}>{config.garantia_tipo_cobertura}</Text>
                </View>
              </View>
            </View>

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

            <Text style={styles.textoLegal}>{texto}</Text>

            <View style={styles.rodapeBloco}>
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
          </View>
        </View>
      </Page>
    </Document>
  );
}
