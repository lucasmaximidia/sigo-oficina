import { Document, Page, View, Text, Image, Link, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import { RESUMO_CONTRATO } from "@/lib/locacao-contrato-texto";
import { identificarDispositivo } from "@/lib/user-agent";
import type { LocacaoFormaPagamento, LocacaoStatusPagamento, LocacaoVeiculoTipo } from "@/types";

const cores = {
  primary: "#1a7a3c",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#e2e6ea",
  bgMuted: "#f2f4f6",
};

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 9, color: cores.text, fontFamily: "Helvetica", lineHeight: 1.3 },
  header: { marginBottom: 5, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: cores.primary },
  marca: { fontSize: 15, fontFamily: "Helvetica-Bold", color: cores.primary },
  marcaSub: { fontSize: 7.5, color: cores.muted, marginTop: 1 },
  titulo: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 5 },
  tituloSub: { fontSize: 7.5, color: cores.muted, marginTop: 1.5, fontFamily: "Helvetica-Oblique" },
  section: { marginTop: 5 },
  sectionTitulo: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    backgroundColor: cores.bgMuted,
    borderLeftWidth: 3,
    borderLeftColor: cores.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 3,
  },
  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  campoLabel: { fontSize: 7, color: cores.muted, textTransform: "uppercase" },
  campoValor: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 1 },
  linha: { fontSize: 9, marginTop: 2 },
  checkLinha: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1.5 },
  checkCaixa: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: cores.text,
    alignItems: "center",
    justifyContent: "center",
  },
  // lineHeight: 1 é essencial aqui — sem isso, a altura de linha padrão do
  // texto (herdada do `lineHeight: 1.3` da página) excede a caixa de 9pt e o
  // "X" é cortado inteiro pelo Yoga/react-pdf, ficando invisível mesmo com
  // `marcado = true` — foi exatamente o bug visto num contrato já assinado.
  checkMarca: { fontSize: 7, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  declaracao: { fontSize: 8, marginTop: 3, color: cores.text },
  assinaturas: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 16 },
  assinaturaBloco: { flex: 1, borderTopWidth: 1, borderTopColor: cores.text, paddingTop: 3, alignItems: "center" },
  assinaturaLabel: { fontSize: 7.5, color: cores.muted },
  rodape: { fontSize: 6, color: cores.muted, marginTop: 3, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 22,
    right: 22,
    textAlign: "center",
    fontSize: 7,
    color: cores.muted,
    borderTopWidth: 1,
    borderTopColor: cores.border,
    paddingTop: 4,
  },
  resumoLinha: { marginBottom: 2.5 },
  resumoTitulo: { fontSize: 7.8, fontFamily: "Helvetica-Bold" },
  resumoTexto: { fontSize: 7.3, color: cores.text, lineHeight: 1.2 },
  qrBloco: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, backgroundColor: cores.bgMuted, borderRadius: 4, padding: 6 },
  qrImg: { width: 40, height: 40 },
  qrTexto: { fontSize: 7.3, color: cores.muted, flex: 1, lineHeight: 1.3 },
  qrLink: { fontSize: 7.3, color: cores.primary, fontFamily: "Helvetica-Bold", marginTop: 2 },
  aceiteBloco: { backgroundColor: cores.bgMuted, borderRadius: 4, padding: 6, marginTop: 2 },
  aceiteLinha: { fontSize: 7.5, color: cores.text, marginTop: 1.5 },
});

function Check({ marcado, children }: { marcado: boolean; children: string }) {
  return (
    <View style={styles.checkLinha}>
      <View style={styles.checkCaixa}>{marcado && <Text style={styles.checkMarca}>X</Text>}</View>
      <Text style={{ fontSize: 8 }}>{children}</Text>
    </View>
  );
}

const FORMA_LABEL: Record<LocacaoFormaPagamento, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

const TIPO_LABEL: Record<LocacaoVeiculoTipo, string> = {
  scooter: "Scooter Elétrica",
  bicicleta: "Bicicleta Elétrica",
};

export function ContratoLocacaoPdf({
  numero,
  cliente,
  veiculo,
  dataRetirada,
  dataPrevistaDevolucao,
  valor,
  valorPago,
  formaPagamento,
  statusPagamento,
  observacoes,
  contratoUrl,
  qrCodeDataUrl,
  aceiteOnlineEm,
  aceiteOnlineNome,
  aceiteOnlineTelefone,
  aceiteOnlineIp,
  aceiteOnlineUserAgent,
  aceiteOnlineFusoHorario,
  aceiteOnlineLatitude,
  aceiteOnlineLongitude,
}: {
  numero: number;
  cliente: { nome: string; cpf: string | null; telefone: string | null };
  veiculo: { tipo: LocacaoVeiculoTipo; marca: string; modelo: string; cor: string | null; chassi: string };
  dataRetirada: string;
  dataPrevistaDevolucao: string;
  valor: number;
  valorPago: number;
  formaPagamento: LocacaoFormaPagamento;
  statusPagamento: LocacaoStatusPagamento;
  observacoes: string | null;
  contratoUrl: string;
  qrCodeDataUrl: string;
  aceiteOnlineEm?: string | null;
  aceiteOnlineNome?: string | null;
  aceiteOnlineTelefone?: string | null;
  aceiteOnlineIp?: string | null;
  aceiteOnlineUserAgent?: string | null;
  aceiteOnlineFusoHorario?: string | null;
  aceiteOnlineLatitude?: number | null;
  aceiteOnlineLongitude?: number | null;
}) {
  const formatarDataHora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(
      new Date(iso)
    );

  return (
    <Document title={`Contrato-Locacao-${numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.marca}>VOLTCITY</Text>
          <Text style={styles.marcaSub}>ALUGUEL E VENDA DE EQUIPAMENTOS ELÉTRICOS</Text>
          <Text style={styles.titulo}>TERMO DE LOCAÇÃO E RECEBIMENTO DE EQUIPAMENTO</Text>
          <Text style={styles.tituloSub}>
            Este Termo é parte integrante e indissociável do Contrato de Locação (resumo abaixo) — aluguel #
            {String(numero).padStart(4, "0")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>01  DADOS DO LOCATÁRIO</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Nome completo</Text>
              <Text style={styles.campoValor}>{cliente.nome}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>CPF</Text>
              <Text style={styles.campoValor}>{cliente.cpf ?? "—"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Telefone</Text>
              <Text style={styles.campoValor}>{cliente.telefone ?? "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>02  DADOS DO EQUIPAMENTO</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Equipamento</Text>
              <Text style={styles.campoValor}>
                {veiculo.marca} {veiculo.modelo}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Tipo / Cor</Text>
              <Text style={styles.campoValor}>
                {TIPO_LABEL[veiculo.tipo]}
                {veiculo.cor ? ` · ${veiculo.cor}` : ""}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Chassi</Text>
              <Text style={styles.campoValor}>{veiculo.chassi}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>03  PERÍODO DA LOCAÇÃO</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Retirada</Text>
              <Text style={styles.campoValor}>{formatarDataHora(dataRetirada)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Devolução prevista</Text>
              <Text style={styles.campoValor}>{formatarDataHora(dataPrevistaDevolucao)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>04  PAGAMENTO</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Valor</Text>
              <Text style={styles.campoValor}>{formatCurrency(valor)}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Forma de pagamento</Text>
              <Text style={styles.campoValor}>{FORMA_LABEL[formaPagamento]}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.campoLabel}>Situação</Text>
              <Text style={styles.campoValor}>
                {statusPagamento === "pago" ? "Pago" : statusPagamento === "parcial" ? "Parcial" : "Pendente"}
              </Text>
            </View>
          </View>
          {valorPago > 0 && valorPago < valor && (
            <View style={[styles.row, { marginTop: 6 }]}>
              <View style={styles.col}>
                <Text style={styles.campoLabel}>Valor já pago</Text>
                <Text style={styles.campoValor}>{formatCurrency(valorPago)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.campoLabel}>Saldo devedor</Text>
                <Text style={styles.campoValor}>{formatCurrency(valor - valorPago)}</Text>
              </View>
              <View style={styles.col} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>05  DECLARAÇÕES DO LOCATÁRIO</Text>
          <Text style={styles.declaracao}>
            O LOCATÁRIO declara que recebeu o equipamento em perfeitas condições aparentes de funcionamento e
            conservação, apto para uso.
          </Text>
          <Check marcado>Recebi orientações sobre a utilização e o carregamento correto do equipamento e estou ciente das regras de uso.</Check>
          <Check marcado>Estou ciente de que o equipamento poderá possuir rastreamento por GPS e/ou sensor NFC para fins de segurança patrimonial.</Check>
          <Check marcado>Li, compreendi e concordo integralmente com o Contrato de Locação resumido abaixo, cujo texto completo está disponível no link/QR code.</Check>
        </View>

        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitulo}>06  OBSERVAÇÕES</Text>
            <Text style={styles.linha}>{observacoes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>07  RESUMO DO CONTRATO DE LOCAÇÃO</Text>
          {RESUMO_CONTRATO.map((item) => (
            <View key={item.titulo} style={styles.resumoLinha}>
              <Text style={styles.resumoTitulo}>{item.titulo}</Text>
              <Text style={styles.resumoTexto}>{item.texto}</Text>
            </View>
          ))}
          <View style={styles.qrBloco}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, sem alt na API */}
            <Image src={qrCodeDataUrl} style={styles.qrImg} />
            <View style={styles.qrTexto}>
              <Text>
                Este é um resumo das principais regras de uso. O contrato completo contém todas as cláusulas e deve
                ser lido pelo locatário.
              </Text>
              <Text style={styles.qrLink}>{contratoUrl}</Text>
            </View>
          </View>
        </View>

        {aceiteOnlineEm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitulo}>08  ACEITE ONLINE</Text>
            <View style={styles.aceiteBloco}>
              <Text style={styles.aceiteLinha}>
                Contrato aceito eletronicamente por {aceiteOnlineNome} em {formatarDataHora(aceiteOnlineEm)}.
              </Text>
              {(aceiteOnlineTelefone || aceiteOnlineIp || aceiteOnlineUserAgent || aceiteOnlineFusoHorario) && (
                <Text style={styles.aceiteLinha}>
                  {[
                    aceiteOnlineTelefone && `Telefone: ${aceiteOnlineTelefone}`,
                    aceiteOnlineIp && `IP: ${aceiteOnlineIp}`,
                    aceiteOnlineUserAgent && identificarDispositivo(aceiteOnlineUserAgent),
                    aceiteOnlineFusoHorario && `Fuso: ${aceiteOnlineFusoHorario}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
              {aceiteOnlineLatitude != null && aceiteOnlineLongitude != null && (
                <Text style={styles.aceiteLinha}>
                  Localização:{" "}
                  <Link href={`https://www.google.com/maps?q=${aceiteOnlineLatitude},${aceiteOnlineLongitude}`} style={{ color: cores.primary }}>
                    {aceiteOnlineLatitude.toFixed(5)}, {aceiteOnlineLongitude.toFixed(5)}
                  </Link>
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBloco}>
            <Text style={styles.assinaturaLabel}>LOCADOR</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text style={styles.assinaturaLabel}>LOCATÁRIO</Text>
          </View>
          <View style={styles.assinaturaBloco}>
            <Text style={styles.assinaturaLabel}>DATA</Text>
          </View>
        </View>
        <Text style={styles.rodape}>
          Declaro que todas as informações acima são verdadeiras, confirmo o recebimento do equipamento descrito
          neste Termo e reconheço como válida minha manifestação de vontade por assinatura física ou eletrônica,
          inclusive mediante confirmação realizada por aplicativo de mensagens (WhatsApp), desde que seja possível
          identificar de forma inequívoca minha autoria e concordância, nos termos da Medida Provisória nº
          2.200-2/2001 e da legislação aplicável.
        </Text>

        <Text style={styles.footer} fixed>
          VoltCity — Aluguel e Venda · (27) 99779-2023 · Termo e Contrato de Locação
        </Text>
      </Page>
    </Document>
  );
}
