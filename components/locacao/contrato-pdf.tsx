import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import type { LocacaoFormaPagamento, LocacaoStatusPagamento, LocacaoVeiculoTipo } from "@/types";

const cores = {
  primary: "#1a7a3c",
  text: "#191c1e",
  muted: "#5b6b70",
  border: "#e2e6ea",
  bgMuted: "#f2f4f6",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: cores.text, fontFamily: "Helvetica", lineHeight: 1.3 },
  header: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: cores.primary },
  marca: { fontSize: 15, fontFamily: "Helvetica-Bold", color: cores.primary },
  marcaSub: { fontSize: 7.5, color: cores.muted, marginTop: 1 },
  titulo: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 8 },
  tituloSub: { fontSize: 7.5, color: cores.muted, marginTop: 1.5, fontFamily: "Helvetica-Oblique" },
  section: { marginTop: 9 },
  sectionTitulo: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    backgroundColor: cores.bgMuted,
    borderLeftWidth: 3,
    borderLeftColor: cores.primary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 5,
  },
  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  campoLabel: { fontSize: 7, color: cores.muted, textTransform: "uppercase" },
  campoValor: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginTop: 1 },
  linha: { fontSize: 9, marginTop: 2 },
  checkLinha: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  checkCaixa: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: cores.text,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMarca: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  declaracao: { fontSize: 8, marginTop: 4, color: cores.text },
  assinaturas: { flexDirection: "row", justifyContent: "space-between", marginTop: 28, gap: 16 },
  assinaturaBloco: { flex: 1, borderTopWidth: 1, borderTopColor: cores.text, paddingTop: 4, alignItems: "center" },
  assinaturaLabel: { fontSize: 7.5, color: cores.muted },
  rodape: { fontSize: 6.5, color: cores.muted, marginTop: 6, textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7,
    color: cores.muted,
    borderTopWidth: 1,
    borderTopColor: cores.border,
    paddingTop: 5,
  },
  clausulas: { flexDirection: "row", gap: 14, marginTop: 8 },
  clausulasCol: { flex: 1, gap: 6 },
  clausulaTitulo: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 1.5 },
  clausulaTexto: { fontSize: 7.3, lineHeight: 1.32, textAlign: "justify" },
  preambulo: { fontSize: 7.5, lineHeight: 1.35, marginTop: 6, textAlign: "justify" },
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

const CLAUSULAS: { titulo: string; texto: string }[] = [
  {
    titulo: "1. DO OBJETO",
    texto:
      "Locação onerosa e por prazo determinado de equipamento elétrico (scooter ou bicicleta) de propriedade da LOCADORA, cujas especificações (marca, modelo, cor e chassi) constam do Termo. Havendo divergência entre este Contrato e o Termo quanto a dados da locação, prevalece o Termo.",
  },
  {
    titulo: "2. CAPACIDADE E REQUISITOS DO LOCATÁRIO",
    texto:
      "O LOCATÁRIO declara, sob as penas da lei, ser maior de 18 anos ou emancipado, possuir plena capacidade civil, e estar apto física e mentalmente a conduzir o equipamento, não estando sob efeito de álcool, entorpecentes ou substância que comprometa sua capacidade de condução. É responsabilidade do LOCATÁRIO observar as exigências legais aplicáveis à condução em via pública (idade mínima, EPIs e, quando exigida, habilitação), nos termos da Lei nº 9.503/1997 (CTB) e regulamentações municipais de micromobilidade elétrica.",
  },
  {
    titulo: "3. DO PRAZO",
    texto:
      "O prazo é o constante do Termo, contado da retirada do equipamento. Prorrogação somente é válida mediante prévia autorização da LOCADORA e cobrança proporcional de valores adicionais, sob pena da multa da Cláusula 10.",
  },
  {
    titulo: "4. DO VALOR, PAGAMENTO E GARANTIA",
    texto:
      "O valor, a forma de pagamento e a situação constam do Termo, devido antecipadamente à retirada, salvo ajuste diverso. Em devolução antecipada por conveniência do LOCATÁRIO, não há restituição proporcional, salvo acordo em contrário. A LOCADORA poderá exigir caução em dinheiro ou pré-autorização em cartão, restituída após a devolução e verificação de integridade do bem, deduzidos danos, multas ou encargos devidos.",
  },
  {
    titulo: "5. DA UTILIZAÇÃO DO EQUIPAMENTO",
    texto:
      "O LOCATÁRIO compromete-se a: utilizar o equipamento exclusivamente para fins lícitos e conforme sua destinação; observar as normas de trânsito e usar equipamentos de segurança, incluindo capacete; não emprestar, sublocar, ceder ou transferir o uso a terceiros; zelar pela guarda e conservação como se seu fosse; não conduzir sob efeito de álcool, entorpecentes ou substâncias que comprometam a condução; não realizar manobras perigosas ou conduta que coloque em risco a si ou terceiros; não transportar carga/passageiros em desacordo com o fabricante; não usar o equipamento para fins ilícitos ou competições não autorizadas; e não modificar, adulterar ou remover componentes, acessórios ou dispositivos, inclusive sensores e sistemas de rastreamento. O descumprimento autoriza a LOCADORA a exigir a devolução imediata do equipamento, sem prejuízo das demais sanções contratuais e legais.",
  },
  {
    titulo: "6. DA RESPONSABILIDADE CIVIL",
    texto:
      "A LOCADORA não responde por danos, ilícitos civis, administrativos ou penais praticados pelo LOCATÁRIO ou decorrentes de uso indevido do equipamento durante a locação. O LOCATÁRIO responde por multas de trânsito, acidentes, danos a terceiros e demais consequências do uso, devendo comunicar imediatamente à LOCADORA qualquer acidente, colisão, queda ou ocorrência relevante, apresentando boletim de ocorrência quando cabível.",
  },
  {
    titulo: "7. DO RASTREAMENTO E DA PROTEÇÃO DE DADOS (LGPD)",
    texto:
      "O equipamento poderá possuir GPS e/ou sensor NFC, usados exclusivamente para segurança patrimonial, localização e recuperação do bem. Os dados pessoais do LOCATÁRIO (nome, CPF, telefone e demais informações necessárias) serão tratados pela LOCADORA conforme a Lei nº 13.709/2018 (LGPD), exclusivamente para execução da locação, cobrança e cumprimento de obrigações legais. Dados de localização não serão usados para finalidade diversa da segurança patrimonial e serão descartados após o encerramento da locação, observado o prazo legal de guarda quando aplicável.",
  },
  {
    titulo: "8. DOS DANOS, MANUTENÇÃO, CONSERVAÇÃO E DEVOLUÇÃO",
    texto:
      "O equipamento deve ser devolvido no mesmo estado em que foi recebido, ressalvado o desgaste natural. Danos por mau uso, negligência, imprudência ou imperícia do LOCATÁRIO serão por ele integralmente suportados, conforme apuração da LOCADORA na devolução. É vedado ao LOCATÁRIO realizar reparos ou intervenção técnica sem autorização prévia da LOCADORA, devendo usar exclusivamente o carregador fornecido; não é recomendada a lavagem do equipamento, devendo eventual limpeza com água ser previamente comunicada à LOCADORA. Em caso de furto, roubo, perda ou desaparecimento, o LOCATÁRIO deve comunicar imediatamente a LOCADORA e apresentar boletim de ocorrência em até 24h, sob pena de ressarcimento integral do valor do equipamento e demais perdas e danos. Na devolução, a LOCADORA vistoriará o equipamento, preferencialmente na presença do LOCATÁRIO; havendo divergência, o LOCATÁRIO pode contestar por escrito em até 48h, sob pena de aceitação tácita.",
  },
  {
    titulo: "9. DA MULTA POR ATRASO E DO INADIMPLEMENTO",
    texto:
      "A não devolução no prazo sujeita o LOCATÁRIO a diária adicional (valor informado pela LOCADORA) por dia/fração de atraso, mais multa moratória de 10% sobre o valor total do contrato e juros de mora de 1% ao mês, pro rata die, sem prejuízo de medidas cabíveis, inclusive judiciais, para recuperação do bem. O inadimplemento de qualquer obrigação pecuniária autoriza cobrança extrajudicial e/ou judicial, acrescida dos encargos legais e contratuais, e a inclusão do nome do LOCATÁRIO em cadastros de proteção ao crédito, observado o devido processo legal.",
  },
  {
    titulo: "10. DAS MULTAS DE TRÂNSITO",
    texto:
      "Todas as multas, autuações e penalidades administrativas decorrentes do uso do equipamento durante a locação são de responsabilidade exclusiva do LOCATÁRIO, podendo a LOCADORA indicá-lo como condutor perante os órgãos de trânsito.",
  },
  {
    titulo: "11. DA RESCISÃO",
    texto:
      "O Contrato pode ser rescindido por mútuo acordo, por descumprimento de cláusula contratual, ou por uso indevido/ilícito que coloque em risco o equipamento ou terceiros. A rescisão por culpa do LOCATÁRIO não o exime do pagamento devido até a efetiva devolução, nem das penalidades contratuais aplicáveis.",
  },
  {
    titulo: "12. DISPOSIÇÕES GERAIS, ASSINATURA ELETRÔNICA E FORO",
    texto:
      "Regem este Contrato o Código Civil e, no que couber, o CDC (Lei nº 8.078/1990). O LOCATÁRIO declara ter recebido o equipamento em perfeitas condições, conforme atestado no Termo. A tolerância quanto ao descumprimento de obrigação não implica novação ou renúncia de direitos, podendo ser exigido o cumprimento integral a qualquer tempo. Este instrumento, em conjunto com o Termo, constitui título executivo extrajudicial (art. 784 do CPC), quando atendidos os requisitos legais. As partes reconhecem como válida e eficaz a assinatura eletrônica deste Contrato e do Termo, inclusive por plataformas digitais ou confirmação via WhatsApp, desde que identificável de forma inequívoca a autoria e concordância, nos termos da MP nº 2.200-2/2001. Fica eleito o foro da comarca de Montanha/ES para dirimir controvérsias, com renúncia a qualquer outro, ressalvada a prerrogativa de foro do domicílio do consumidor (art. 101, I, do CDC), quando aplicável. As partes buscarão, preferencialmente, resolver de forma amigável eventuais controvérsias.",
  },
];

export function ContratoLocacaoPdf({
  numero,
  cliente,
  veiculo,
  dataRetirada,
  dataPrevistaDevolucao,
  valor,
  formaPagamento,
  statusPagamento,
  observacoes,
  locadora,
}: {
  numero: number;
  cliente: { nome: string; cpf: string | null; telefone: string | null };
  veiculo: { tipo: LocacaoVeiculoTipo; marca: string; modelo: string; cor: string | null; chassi: string };
  dataRetirada: string;
  dataPrevistaDevolucao: string;
  valor: number;
  formaPagamento: LocacaoFormaPagamento;
  statusPagamento: LocacaoStatusPagamento;
  observacoes: string | null;
  locadora: { razaoSocial: string; cnpj: string; endereco: string };
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
            Este Termo é parte integrante e indissociável do Contrato de Locação (verso) — aluguel #{String(numero).padStart(4, "0")}
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>05  DECLARAÇÃO DE RECEBIMENTO</Text>
          <Text style={styles.declaracao}>
            O LOCATÁRIO declara que recebeu o equipamento em perfeitas condições aparentes de funcionamento e
            conservação, apto para uso.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitulo}>06  DECLARAÇÕES DO LOCATÁRIO</Text>
          <Check marcado>Recebi orientações sobre a utilização e o carregamento correto do equipamento e estou ciente das regras de uso.</Check>
          <Check marcado>Estou ciente de que o equipamento poderá possuir rastreamento por GPS e/ou sensor NFC para fins de segurança patrimonial.</Check>
          <Check marcado>Li, compreendi e concordo integralmente com o Contrato de Locação de Equipamento Elétrico impresso no verso deste Termo.</Check>
        </View>

        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitulo}>07  OBSERVAÇÕES</Text>
            <Text style={styles.linha}>{observacoes}</Text>
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

        <Text style={styles.footer}>VoltCity — Aluguel e Venda · Termo de Locação e Contrato · Página 1/2</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.marca}>VOLTCITY</Text>
          <Text style={styles.marcaSub}>ALUGUEL E VENDA DE EQUIPAMENTOS ELÉTRICOS</Text>
          <Text style={styles.titulo}>CONTRATO DE LOCAÇÃO DE EQUIPAMENTO ELÉTRICO</Text>
          <Text style={styles.tituloSub}>
            Parte integrante e indissociável do Termo de Locação e Recebimento de Equipamento (frente). Os dois
            documentos são enviados e assinados em conjunto.
          </Text>
        </View>

        <Text style={styles.preambulo}>
          Pelo presente instrumento particular de locação de bem móvel (&ldquo;Contrato&rdquo;), de um lado{" "}
          {locadora.razaoSocial}, pessoa jurídica de direito privado, inscrita no CNPJ nº {locadora.cnpj}, com sede
          em {locadora.endereco}, doravante LOCADORA; e de outro lado a pessoa qualificada no Termo de Locação e
          Recebimento de Equipamento (&ldquo;Termo&rdquo;), que a este Contrato integra e do qual é parte inseparável,
          doravante LOCATÁRIO(A); têm entre si justo e contratado o presente instrumento, regido pelas cláusulas
          seguintes.
        </Text>

        <View style={styles.clausulas}>
          <View style={styles.clausulasCol}>
            {CLAUSULAS.slice(0, 6).map((c) => (
              <View key={c.titulo}>
                <Text style={styles.clausulaTitulo}>{c.titulo}</Text>
                <Text style={styles.clausulaTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
          <View style={styles.clausulasCol}>
            {CLAUSULAS.slice(6).map((c) => (
              <View key={c.titulo}>
                <Text style={styles.clausulaTitulo}>{c.titulo}</Text>
                <Text style={styles.clausulaTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>VoltCity — Aluguel e Venda · Termo de Locação e Contrato · Página 2/2</Text>
      </Page>
    </Document>
  );
}
