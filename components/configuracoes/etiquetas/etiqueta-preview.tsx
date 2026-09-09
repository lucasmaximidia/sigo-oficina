import { EtiquetaPecaImage } from "@/components/estoque/etiqueta-peca-image";
import { EtiquetaOsImage } from "@/components/ordens-servico/etiqueta-image";
import { EtiquetaAutorizadaImage } from "@/components/ordens-servico/etiqueta-autorizada-image";
import type { EtiquetaTipo, EtiquetaTipoConfig } from "@/types";

const DADOS_EXEMPLO = {
  peca: { nome: "CORREIA DE TRANSMISSÃO V-12", codigo: "COR-001", precoVenda: 45.9 },
  os: {
    numero: 47,
    clienteNome: "MARIA SILVA",
    clienteTelefone: "(11) 98888-7777",
    problema: "NÃO LIGA / SEM ENERGIA",
    equipamentoDescricao: "BRASTEMP 12KG",
    dataEntrada: "09/09/2026",
  },
  autorizada: {
    empresaNome: "IPC",
    clienteNome: "MARIA SILVA",
    clienteTelefone: "(11) 98888-7777",
    produto: "EXTRATORA IPC LITE",
    numeroSerie: "SB25A126808",
    referencia: "FW010096",
    numeroOsAutorizada: "OS72787636",
    dataEntrada: "09/09/2026",
  },
};

export function EtiquetaPreview({
  tipo,
  config,
  logoUrl,
}: {
  tipo: EtiquetaTipo;
  config: EtiquetaTipoConfig;
  logoUrl: string | null;
}) {
  if (tipo === "peca") {
    const dados = DADOS_EXEMPLO.peca;
    return (
      <EtiquetaPecaImage logoUrl={logoUrl} nome={dados.nome} codigo={dados.codigo} precoVenda={dados.precoVenda} config={config} />
    );
  }

  if (tipo === "os") {
    const dados = DADOS_EXEMPLO.os;
    return (
      <EtiquetaOsImage
        config={{ etiqueta_logo_url: logoUrl }}
        campoConfig={config}
        numero={dados.numero}
        clienteNome={dados.clienteNome}
        clienteTelefone={dados.clienteTelefone}
        problema={dados.problema}
        equipamentoDescricao={dados.equipamentoDescricao}
        dataEntrada={dados.dataEntrada}
      />
    );
  }

  const dados = DADOS_EXEMPLO.autorizada;
  return (
    <EtiquetaAutorizadaImage
      config={{ etiqueta_logo_url: logoUrl }}
      campoConfig={config}
      empresaNome={dados.empresaNome}
      clienteNome={dados.clienteNome}
      clienteTelefone={dados.clienteTelefone}
      produto={dados.produto}
      numeroSerie={dados.numeroSerie}
      referencia={dados.referencia}
      numeroOsAutorizada={dados.numeroOsAutorizada}
      dataEntrada={dados.dataEntrada}
    />
  );
}
