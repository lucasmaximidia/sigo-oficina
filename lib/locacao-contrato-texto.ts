// Texto do contrato de locação (VoltCity) — fonte única usada tanto no PDF
// de 1 página (resumo) quanto na página pública completa (atrás do
// link/QR code do PDF). Ver components/locacao/contrato-pdf.tsx e
// app/locacao/contrato/[aluguelId]/page.tsx.

export const RESUMO_CONTRATO: { titulo: string; texto: string }[] = [
  {
    titulo: "Multa por atraso",
    texto:
      "Diária adicional por dia de atraso, mais multa de 10% sobre o valor total do contrato e juros de 1% ao mês.",
  },
  {
    titulo: "Responsabilidade do locatário",
    texto:
      "Por danos ao equipamento (exceto desgaste natural) e por furto/roubo/perda (comunicar em até 24h); por acidentes e danos a terceiros decorrentes de mau uso, imprudência ou descumprimento das regras de trânsito.",
  },
  {
    titulo: "Regras de uso",
    texto:
      "Exclusivo do locatário (proibido emprestar, sublocar, ceder ou repassar a terceiros); uso de capacete é responsabilidade do locatário; limitado ao perímetro urbano (nunca rodovias ou estradas rurais); proibido conduzir sob efeito de álcool ou drogas; usar somente o carregador fornecido; não exceder o peso recomendado pelo fabricante; proibido fazer reparos por conta própria ou alterar/remover componentes e sensores — qualquer problema deve ser reportado à VoltCity; não lavar o equipamento com água/mangueira (pode danificar o sistema elétrico).",
  },
  {
    titulo: "Rastreamento e dados (LGPD)",
    texto:
      "O equipamento pode ter GPS só para segurança patrimonial; dados pessoais tratados conforme a LGPD e descartados após a locação.",
  },
  {
    titulo: "Devolução e vistoria",
    texto: "Equipamento deve voltar no mesmo estado recebido; divergência pode ser contestada por escrito em até 48h.",
  },
  {
    titulo: "Foro",
    texto: "Comarca de Montanha/ES, ressalvado o foro do consumidor quando aplicável.",
  },
];

export const CLAUSULAS_CONTRATO: { titulo: string; texto: string }[] = [
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
