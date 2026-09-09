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

function campoConfigPadrao(id: string, alinhamento: EtiquetaAlinhamento, tamanhoFonte: EtiquetaTamanhoFonte): EtiquetaCampoConfig {
  return { id, visivel: true, alinhamento, tamanhoFonte };
}

export const CONFIG_PADRAO: Record<EtiquetaTipo, EtiquetaTipoConfig> = {
  peca: {
    alturaMm: 30,
    mostrarLogo: true,
    campos: [
      campoConfigPadrao("nome", "left", "grande"),
      campoConfigPadrao("codigo", "left", "pequena"),
      campoConfigPadrao("preco_venda", "center", "grande"),
    ],
  },
  os: {
    alturaMm: 80,
    mostrarLogo: true,
    campos: [
      campoConfigPadrao("cliente_nome", "center", "grande"),
      campoConfigPadrao("cliente_telefone", "center", "media"),
      campoConfigPadrao("equipamento", "center", "media"),
      campoConfigPadrao("defeito", "center", "media"),
      campoConfigPadrao("data_entrada", "left", "pequena"),
      campoConfigPadrao("numero_os", "left", "pequena"),
    ],
  },
  autorizada: {
    alturaMm: 80,
    mostrarLogo: true,
    campos: [
      campoConfigPadrao("cliente_nome", "center", "media"),
      campoConfigPadrao("cliente_telefone", "center", "pequena"),
      campoConfigPadrao("produto", "center", "media"),
      campoConfigPadrao("numero_serie", "left", "media"),
      campoConfigPadrao("referencia", "left", "media"),
      campoConfigPadrao("numero_os_autorizada", "left", "pequena"),
      campoConfigPadrao("data_entrada", "left", "pequena"),
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
  const existentes = (config.campos ?? []).filter((c) => catalogo.has(c.id));
  const idsExistentes = new Set(existentes.map((c) => c.id));
  const faltantes = padrao.campos.filter((c) => !idsExistentes.has(c.id));

  return {
    alturaMm: config.alturaMm || padrao.alturaMm,
    mostrarLogo: config.mostrarLogo ?? true,
    campos: [...existentes, ...faltantes],
  };
}
