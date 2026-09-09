import type { EtiquetaAlinhamento, EtiquetaCampoConfig, EtiquetaTamanhoFonte, EtiquetaTipo, EtiquetaTipoConfig } from "@/types";

// A impressora térmica usada é sempre 50mm de largura — só a altura da
// etiqueta varia, então as opções abaixo cobrem os tamanhos mais comuns.
export const ETIQUETA_LARGURA_MM = 50;
export const ALTURAS_DISPONIVEIS_MM = [30, 40, 50, 60, 80, 100] as const;

// Escala usada nas imagens geradas: 10px por mm (mesma escala já usada nas
// etiquetas existentes — 500px de largura = 50mm).
export const ETIQUETA_PX_POR_MM = 10;

export const TAMANHOS_FONTE_PX: Record<EtiquetaTipo, Record<EtiquetaTamanhoFonte, number>> = {
  peca: { pequena: 24, media: 32, grande: 40 },
  os: { pequena: 26, media: 34, grande: 44 },
  autorizada: { pequena: 22, media: 28, grande: 36 },
};

// Faixa aceita para a altura da logo, controlada em pixels pelo usuário.
export const LOGO_ALTURA_PX_MIN = 20;
export const LOGO_ALTURA_PX_MAX = 400;

// Faixa aceita para o espaçamento entre campos, controlado em pixels pelo
// usuário — o espaço ocupado pelo conjunto de campos visíveis varia com
// esses valores, e o que resta é distribuído como margem ao redor do bloco
// (a altura total continua fixa, definida pelo tamanho da etiqueta).
export const ESPACAMENTO_CAMPO_PX_MIN = 0;
export const ESPACAMENTO_CAMPO_PX_MAX = 200;

export interface EtiquetaCampoDefinicao {
  id: string;
  label: string;
}

export const CAMPOS_POR_TIPO: Record<EtiquetaTipo, EtiquetaCampoDefinicao[]> = {
  peca: [
    { id: "nome", label: "Nome da peça" },
    { id: "codigo", label: "Código" },
    { id: "preco_venda", label: "Preço de venda" },
  ],
  os: [
    { id: "cliente_nome", label: "Nome do cliente" },
    { id: "cliente_telefone", label: "Telefone do cliente" },
    { id: "equipamento", label: "Equipamento" },
    { id: "defeito", label: "Defeito relatado" },
    { id: "data_entrada", label: "Data de entrada" },
    { id: "numero_os", label: "Nº da O.S." },
  ],
  autorizada: [
    { id: "cliente_nome", label: "Nome do cliente" },
    { id: "cliente_telefone", label: "Telefone do cliente" },
    { id: "produto", label: "Produto" },
    { id: "numero_serie", label: "Nº de série" },
    { id: "referencia", label: "Referência" },
    { id: "numero_os_autorizada", label: "Nº da O.S. da autorizada" },
    { id: "data_entrada", label: "Data de entrada" },
  ],
};

export const ETIQUETA_TIPO_LABEL: Record<EtiquetaTipo, string> = {
  peca: "Impressão (peças em estoque)",
  os: "Ordem de Serviço",
  autorizada: "OS de Autorizada",
};

function campoConfigPadrao(
  id: string,
  alinhamento: EtiquetaAlinhamento,
  tamanhoFonte: EtiquetaTamanhoFonte,
  espacamentoDepoisPx: number,
  compartilharLinha = false,
  mostrarDivisorDepois = false
): EtiquetaCampoConfig {
  return { id, visivel: true, alinhamento, tamanhoFonte, compartilharLinha, mostrarDivisorDepois, espacamentoDepoisPx };
}

export const CONFIG_PADRAO: Record<EtiquetaTipo, EtiquetaTipoConfig> = {
  peca: {
    alturaMm: 30,
    mostrarLogo: true,
    logoAlturaPx: 72,
    mostrarDivisorCabecalho: false,
    campos: [
      campoConfigPadrao("nome", "left", "grande", 12),
      campoConfigPadrao("codigo", "left", "pequena", 12),
      campoConfigPadrao("preco_venda", "center", "grande", 12),
    ],
  },
  os: {
    alturaMm: 80,
    mostrarLogo: true,
    logoAlturaPx: 240,
    mostrarDivisorCabecalho: false,
    campos: [
      campoConfigPadrao("cliente_nome", "center", "grande", 18),
      campoConfigPadrao("cliente_telefone", "center", "media", 18),
      campoConfigPadrao("equipamento", "center", "media", 18),
      campoConfigPadrao("defeito", "center", "media", 18),
      campoConfigPadrao("data_entrada", "left", "pequena", 18, true),
      campoConfigPadrao("numero_os", "left", "pequena", 18),
    ],
  },
  autorizada: {
    alturaMm: 80,
    mostrarLogo: true,
    logoAlturaPx: 150,
    mostrarDivisorCabecalho: false,
    campos: [
      campoConfigPadrao("cliente_nome", "center", "media", 18),
      campoConfigPadrao("cliente_telefone", "center", "pequena", 18),
      campoConfigPadrao("produto", "center", "media", 18),
      campoConfigPadrao("numero_serie", "left", "media", 18),
      campoConfigPadrao("referencia", "left", "media", 18),
      campoConfigPadrao("numero_os_autorizada", "left", "pequena", 18, true),
      campoConfigPadrao("data_entrada", "left", "pequena", 18),
    ],
  },
};

// Garante que a config tenha uma entrada por campo do catálogo (na mesma
// ordem salva) mesmo que o JSON salvo esteja desatualizado ou incompleto —
// evita que um campo "suma" da tela de configuração ou da etiqueta.
export function normalizarEtiquetaConfig(tipo: EtiquetaTipo, config: EtiquetaTipoConfig | null | undefined): EtiquetaTipoConfig {
  const padrao = CONFIG_PADRAO[tipo];
  if (!config) return padrao;

  const catalogo = new Set(CAMPOS_POR_TIPO[tipo].map((c) => c.id));
  const espacamentoPadraoPorId = new Map(padrao.campos.map((c) => [c.id, c.espacamentoDepoisPx]));
  const existentes = (config.campos ?? [])
    .filter((c) => catalogo.has(c.id))
    .map((c) => ({
      ...c,
      compartilharLinha: c.compartilharLinha ?? false,
      mostrarDivisorDepois: c.mostrarDivisorDepois ?? false,
      espacamentoDepoisPx: c.espacamentoDepoisPx ?? espacamentoPadraoPorId.get(c.id) ?? 18,
    }));
  const idsExistentes = new Set(existentes.map((c) => c.id));
  const faltantes = padrao.campos.filter((c) => !idsExistentes.has(c.id));

  return {
    alturaMm: config.alturaMm || padrao.alturaMm,
    mostrarLogo: config.mostrarLogo ?? true,
    logoAlturaPx: config.logoAlturaPx || padrao.logoAlturaPx,
    mostrarDivisorCabecalho: config.mostrarDivisorCabecalho ?? padrao.mostrarDivisorCabecalho,
    campos: [...existentes, ...faltantes],
  };
}

// Agrupa os campos visíveis em linhas: um campo com compartilharLinha=true
// forma uma linha só com o próximo campo visível (lado a lado), em vez de
// uma linha por campo.
export function agruparCamposEmLinhas(camposVisiveis: EtiquetaCampoConfig[]): EtiquetaCampoConfig[][] {
  const linhas: EtiquetaCampoConfig[][] = [];
  for (let i = 0; i < camposVisiveis.length; i++) {
    const atual = camposVisiveis[i];
    const proximo = camposVisiveis[i + 1];
    if (atual.compartilharLinha && proximo) {
      linhas.push([atual, proximo]);
      i++;
    } else {
      linhas.push([atual]);
    }
  }
  return linhas;
}
