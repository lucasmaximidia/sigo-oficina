import { IconCaixa } from "@/components/ordens-servico/etiqueta-icons";
import { EtiquetaCampoLinha, EtiquetaDivisorFino, EtiquetaLinha } from "@/components/etiquetas/etiqueta-campo";
import { agruparCamposEmLinhas, ETIQUETA_PX_POR_MM, TAMANHOS_FONTE_PX } from "@/lib/etiqueta-config";
import type { EtiquetaTipoConfig } from "@/types";

export const ETIQUETA_PECA_LARGURA = 500;

// Satori (motor de renderização do ImageResponse) não aplica -webkit-line-clamp,
// então mesmo na menor fonte um nome muito longo estouraria a área da
// etiqueta — por isso o texto é truncado com reticências além deste limite.
const LIMITE_CARACTERES_NOME = 130;

function truncarNomeEtiqueta(nome: string): string {
  if (nome.length <= LIMITE_CARACTERES_NOME) return nome;
  return `${nome.slice(0, LIMITE_CARACTERES_NOME - 1).trimEnd()}…`;
}

function valorDoCampo(id: string, nome: string, codigo: string | null, precoVenda: number): string {
  switch (id) {
    case "nome":
      return truncarNomeEtiqueta(nome);
    case "codigo":
      return codigo ? `Cód: ${codigo}` : "Sem código";
    case "preco_venda":
      return `R$ ${precoVenda.toFixed(2).replace(".", ",")}`;
    default:
      return "";
  }
}

export function EtiquetaPecaImage({
  logoUrl,
  nome,
  codigo,
  precoVenda,
  config,
}: {
  logoUrl: string | null;
  nome: string;
  codigo: string | null;
  precoVenda: number;
  config: EtiquetaTipoConfig;
}) {
  const alturaTotal = config.alturaMm * ETIQUETA_PX_POR_MM;
  const camposVisiveis = config.campos.filter((c) => c.visivel);
  const logoAlturaPx = config.logoAlturaPx;

  return (
    <div
      style={{
        width: ETIQUETA_PECA_LARGURA,
        height: alturaTotal,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Montserrat",
        color: "#111111",
      }}
    >
      {config.mostrarLogo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: logoAlturaPx,
            flexShrink: 0,
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              style={{ width: ETIQUETA_PECA_LARGURA, height: logoAlturaPx, objectFit: "contain" }}
              alt=""
            />
          ) : (
            <IconCaixa size={56} color="#cccccc" />
          )}
        </div>
      )}

      {config.mostrarDivisorCabecalho && <EtiquetaDivisorFino />}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          width: "100%",
          padding: "16px 24px",
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
                  valor={valorDoCampo(campo.id, nome, codigo, precoVenda)}
                  alinhamento={campo.alinhamento}
                  fontSizePx={TAMANHOS_FONTE_PX.peca[campo.tamanhoFonte]}
                />
              ))}
            </EtiquetaLinha>
            {linha[0].mostrarDivisorDepois && (
              <div style={{ display: "flex", marginTop: 8 }}>
                <EtiquetaDivisorFino />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
