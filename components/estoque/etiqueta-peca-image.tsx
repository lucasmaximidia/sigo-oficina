import { IconCaixa } from "@/components/ordens-servico/etiqueta-icons";

export const ETIQUETA_PECA_LARGURA = 500;
export const ETIQUETA_PECA_ALTURA = 300;

// Grid fixo: cada zona tem uma altura exata e a soma bate certinho com
// ETIQUETA_PECA_ALTURA, preenchendo a etiqueta de ponta a ponta sem sobra.
const ALTURA_CABECALHO = 130;
const ALTURA_CODIGO = 70;
const ALTURA_PRECO = 100;

function DivisorFino() {
  return <div style={{ display: "flex", height: 2, background: "#111111" }} />;
}

export function EtiquetaPecaImage({
  logoUrl,
  nome,
  codigo,
  precoVenda,
}: {
  logoUrl: string | null;
  nome: string;
  codigo: string | null;
  precoVenda: number;
}) {
  const [reais, centavos] = precoVenda.toFixed(2).split(".");

  return (
    <div
      style={{
        width: ETIQUETA_PECA_LARGURA,
        height: ETIQUETA_PECA_ALTURA,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Montserrat",
        color: "#111111",
      }}
    >
      {/* 1. Cabeçalho: nome do produto + logo da empresa (ou ícone padrão) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: ALTURA_CABECALHO,
          padding: "0 24px",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.15,
            flex: 1,
            minWidth: 0,
          }}
        >
          {nome}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            flexShrink: 0,
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} width={72} height={72} style={{ objectFit: "contain" }} alt="" />
          ) : (
            <IconCaixa size={56} color="#cccccc" />
          )}
        </div>
      </div>

      {/* 2. Código do produto */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_CODIGO,
          padding: "0 24px",
        }}
      >
        <DivisorFino />
        <span style={{ fontSize: 24, color: "#333333", marginTop: 12 }}>
          {codigo ? `Cód: ${codigo}` : "Sem código"}
        </span>
      </div>

      {/* 3. Preço de venda */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: ALTURA_PRECO,
          padding: "0 24px",
        }}
      >
        <DivisorFino />
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>R$</span>
          <span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1 }}>
            {reais},{centavos}
          </span>
        </div>
      </div>
    </div>
  );
}
