import { IconLavadora } from "./etiqueta-icons";
import { EtiquetaCampoLinha, EtiquetaDivisorFino, EtiquetaLinha } from "@/components/etiquetas/etiqueta-campo";
import { agruparCamposEmLinhas, ETIQUETA_PX_POR_MM, TAMANHOS_FONTE_PX } from "@/lib/etiqueta-config";
import type { Configuracao, EtiquetaTipoConfig } from "@/types";

export const ETIQUETA_LARGURA = 500;
const ALTURA_CABECALHO = 240;

function valorDoCampo(
  id: string,
  dados: {
    numeroOs: string;
    clienteNome: string;
    clienteTelefone: string | null;
    problema: string;
    equipamentoDescricao: string;
    dataEntrada: string;
  }
): string {
  switch (id) {
    case "cliente_nome":
      return dados.clienteNome;
    case "cliente_telefone":
      return dados.clienteTelefone ?? "";
    case "equipamento":
      return dados.equipamentoDescricao;
    case "defeito":
      return dados.problema;
    case "data_entrada":
      return dados.dataEntrada;
    case "numero_os":
      return dados.numeroOs;
    default:
      return "";
  }
}

const LABEL_DO_CAMPO: Record<string, string> = {
  equipamento: "Equipamento",
  defeito: "Defeito Relatado",
  data_entrada: "Data Entrada",
  numero_os: "Nº O.S.",
};

export function EtiquetaOsImage({
  config,
  campoConfig,
  numero,
  clienteNome,
  clienteTelefone,
  problema,
  equipamentoDescricao,
  dataEntrada,
}: {
  config: Pick<Configuracao, "etiqueta_logo_url">;
  campoConfig: EtiquetaTipoConfig;
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  problema: string;
  equipamentoDescricao: string;
  dataEntrada: string;
}) {
  const numeroOs = `OS-${String(numero).padStart(4, "0")}`;
  const dados = { numeroOs, clienteNome, clienteTelefone, problema, equipamentoDescricao, dataEntrada };
  const camposVisiveis = campoConfig.campos.filter((c) => c.visivel && (c.id !== "cliente_telefone" || clienteTelefone));
  const alturaTotal = campoConfig.alturaMm * ETIQUETA_PX_POR_MM;

  return (
    <div
      style={{
        width: ETIQUETA_LARGURA,
        height: alturaTotal,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Montserrat",
        color: "#111111",
      }}
    >
      {campoConfig.mostrarLogo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: ALTURA_CABECALHO,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {config.etiqueta_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.etiqueta_logo_url}
              style={{ width: ETIQUETA_LARGURA, height: ALTURA_CABECALHO, objectFit: "contain" }}
              alt=""
            />
          ) : (
            <IconLavadora size={90} color="#cccccc" />
          )}
        </div>
      )}

      <EtiquetaDivisorFino />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-around",
          width: "100%",
          padding: "12px 24px",
          minHeight: 0,
        }}
      >
        {agruparCamposEmLinhas(camposVisiveis).map((linha) => (
          <EtiquetaLinha key={linha.map((c) => c.id).join("+")}>
            {linha.map((campo) => (
              <EtiquetaCampoLinha
                key={campo.id}
                label={LABEL_DO_CAMPO[campo.id]}
                valor={valorDoCampo(campo.id, dados)}
                alinhamento={campo.alinhamento}
                fontSizePx={TAMANHOS_FONTE_PX.os[campo.tamanhoFonte]}
              />
            ))}
          </EtiquetaLinha>
        ))}
      </div>
    </div>
  );
}
