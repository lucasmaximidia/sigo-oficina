import { IconLavadora } from "./etiqueta-icons";
import { EtiquetaCampoLinha, EtiquetaDivisorFino, EtiquetaLinha } from "@/components/etiquetas/etiqueta-campo";
import { agruparCamposEmLinhas, ETIQUETA_PX_POR_MM, TAMANHOS_FONTE_PX } from "@/lib/etiqueta-config";
import type { Configuracao, EtiquetaTipoConfig } from "@/types";

export const ETIQUETA_AUTORIZADA_LARGURA = 500;
const ALTURA_CABECALHO = 188;

function valorDoCampo(
  id: string,
  dados: {
    clienteNome: string;
    clienteTelefone: string | null;
    produto: string;
    numeroSerie: string;
    referencia: string;
    numeroOsAutorizada: string;
    dataEntrada: string;
  }
): string {
  switch (id) {
    case "cliente_nome":
      return dados.clienteNome;
    case "cliente_telefone":
      return dados.clienteTelefone ?? "";
    case "produto":
      return dados.produto;
    case "numero_serie":
      return dados.numeroSerie || "—";
    case "referencia":
      return dados.referencia || "—";
    case "numero_os_autorizada":
      return dados.numeroOsAutorizada || "—";
    case "data_entrada":
      return dados.dataEntrada;
    default:
      return "";
  }
}

const LABEL_DO_CAMPO: Record<string, string> = {
  produto: "Produto",
  numero_serie: "Nº de Série",
  referencia: "Referência",
  numero_os_autorizada: "Nº OS Autorizada",
  data_entrada: "Data Entrada",
};

export function EtiquetaAutorizadaImage({
  config,
  campoConfig,
  empresaNome,
  clienteNome,
  clienteTelefone,
  produto,
  numeroSerie,
  referencia,
  numeroOsAutorizada,
  dataEntrada,
}: {
  config: Pick<Configuracao, "etiqueta_logo_url">;
  campoConfig: EtiquetaTipoConfig;
  empresaNome: string;
  clienteNome: string;
  clienteTelefone: string | null;
  produto: string;
  numeroSerie: string;
  referencia: string;
  numeroOsAutorizada: string;
  dataEntrada: string;
}) {
  const dados = { clienteNome, clienteTelefone, produto, numeroSerie, referencia, numeroOsAutorizada, dataEntrada };
  const camposVisiveis = campoConfig.campos.filter((c) => c.visivel && (c.id !== "cliente_telefone" || clienteTelefone));
  const alturaTotal = campoConfig.alturaMm * ETIQUETA_PX_POR_MM;

  return (
    <div
      style={{
        width: ETIQUETA_AUTORIZADA_LARGURA,
        height: alturaTotal,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Montserrat",
        color: "#111111",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: campoConfig.mostrarLogo ? ALTURA_CABECALHO : ALTURA_CABECALHO - 150,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {campoConfig.mostrarLogo &&
          (config.etiqueta_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.etiqueta_logo_url}
              style={{ width: ETIQUETA_AUTORIZADA_LARGURA, height: 150, objectFit: "contain" }}
              alt=""
            />
          ) : (
            <IconLavadora size={70} color="#cccccc" />
          ))}
        <span style={{ fontSize: 25, fontWeight: 700, color: "#111111", marginTop: 4 }}>
          AUTORIZADA {empresaNome}
        </span>
      </div>

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
                fontSizePx={TAMANHOS_FONTE_PX.autorizada[campo.tamanhoFonte]}
              />
            ))}
          </EtiquetaLinha>
        ))}
      </div>
    </div>
  );
}
