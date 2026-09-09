import { IconLavadora } from "./etiqueta-icons";
import { EtiquetaCampoLinha, EtiquetaDivisorFino, EtiquetaLinha } from "@/components/etiquetas/etiqueta-campo";
import { agruparCamposEmLinhas, ETIQUETA_PX_POR_MM, TAMANHOS_FONTE_PX } from "@/lib/etiqueta-config";
import type { Configuracao, EtiquetaTipoConfig } from "@/types";

export const ETIQUETA_AUTORIZADA_LARGURA = 500;
// Espaço reservado para o texto "AUTORIZADA {empresa}", que sempre aparece
// abaixo da logo (ou sozinho, quando a logo está desativada).
const ALTURA_TEXTO_EMPRESA = 38;

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
  const logoAlturaPx = campoConfig.logoAlturaPx;

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
          height: (campoConfig.mostrarLogo ? logoAlturaPx : 0) + ALTURA_TEXTO_EMPRESA,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {campoConfig.mostrarLogo &&
          (config.etiqueta_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.etiqueta_logo_url}
              style={{ width: ETIQUETA_AUTORIZADA_LARGURA, height: logoAlturaPx, objectFit: "contain" }}
              alt=""
            />
          ) : (
            <IconLavadora size={70} color="#cccccc" />
          ))}
        <span style={{ fontSize: 25, fontWeight: 700, color: "#111111", marginTop: 4 }}>
          AUTORIZADA {empresaNome}
        </span>
      </div>

      {campoConfig.mostrarDivisorCabecalho && <EtiquetaDivisorFino />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          width: "100%",
          padding: "20px 24px",
          minHeight: 0,
        }}
      >
        {agruparCamposEmLinhas(camposVisiveis).map((linha, index, linhas) => (
          <div
            key={linha.map((c) => c.id).join("+")}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginBottom: index < linhas.length - 1 ? linha[0].espacamentoDepoisPx : 0,
            }}
          >
            <EtiquetaLinha>
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
            {linha[0].mostrarDivisorDepois && (
              <div style={{ display: "flex", marginTop: 10 }}>
                <EtiquetaDivisorFino />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
