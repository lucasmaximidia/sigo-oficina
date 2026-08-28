import { IconCalendario, IconDocumento, IconLavadora } from "./etiqueta-icons";
import type { Configuracao } from "@/types";

export const ETIQUETA_AUTORIZADA_LARGURA = 500;
export const ETIQUETA_AUTORIZADA_ALTURA = 800;

// Grid fixo: cada zona tem uma altura exata e a soma bate certinho com
// ETIQUETA_AUTORIZADA_ALTURA, preenchendo a etiqueta de ponta a ponta sem sobra.
const ALTURA_CABECALHO = 200;
const ALTURA_CLIENTE = 140;
const ALTURA_PRODUTO = 140;
const ALTURA_SERIE_REFERENCIA = 200;
const ALTURA_OS_DATA = 120;

function CampoData({ icon, label, valor }: { icon: React.ReactNode; label: string; valor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 18, color: "#333333" }}>{label}</span>
      </div>
      <span style={{ fontSize: 24, fontWeight: 700, color: "#111111", lineHeight: 1.15 }}>{valor}</span>
    </div>
  );
}

function DivisorFino() {
  return <div style={{ display: "flex", height: 2, background: "#111111" }} />;
}

export function EtiquetaAutorizadaImage({
  config,
  empresaNome,
  clienteNome,
  produto,
  numeroSerie,
  referencia,
  numeroOsAutorizada,
  dataEntrada,
}: {
  config: Pick<Configuracao, "etiqueta_logo_url">;
  empresaNome: string;
  clienteNome: string;
  produto: string;
  numeroSerie: string;
  referencia: string;
  numeroOsAutorizada: string;
  dataEntrada: string;
}) {
  return (
    <div
      style={{
        width: ETIQUETA_AUTORIZADA_LARGURA,
        height: ETIQUETA_AUTORIZADA_ALTURA,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Montserrat",
        color: "#111111",
      }}
    >
      {/* 1. Cabeçalho: logo + nome da empresa autorizada */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_CABECALHO,
          overflow: "hidden",
        }}
      >
        {config.etiqueta_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.etiqueta_logo_url}
            width={ETIQUETA_AUTORIZADA_LARGURA}
            height={150}
            style={{ objectFit: "contain" }}
            alt=""
          />
        ) : (
          <IconLavadora size={70} color="#cccccc" />
        )}
        <span style={{ fontSize: 22, fontWeight: 700, color: "#111111", marginTop: 4 }}>
          AUTORIZADA {empresaNome}
        </span>
      </div>

      {/* 2. Cliente */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          height: ALTURA_CLIENTE,
          padding: "0 20px",
        }}
      >
        <DivisorFino />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16 }}>
          <span style={{ fontSize: 18, color: "#333333" }}>Cliente</span>
          <span style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{clienteNome}</span>
        </div>
      </div>

      {/* 3. Produto */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          height: ALTURA_PRODUTO,
          padding: "0 20px",
        }}
      >
        <span style={{ fontSize: 18, color: "#333333" }}>Produto</span>
        <span style={{ fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{produto}</span>
      </div>

      {/* 4. Nº de série e Referência */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_SERIE_REFERENCIA,
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            border: "2px solid #111111",
            borderRadius: 12,
            padding: "16px 20px",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "#333333" }}>Nº de Série</span>
            <span style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{numeroSerie || "—"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "#333333" }}>Referência</span>
            <span style={{ fontSize: 26, fontWeight: 700, marginTop: 2 }}>{referencia || "—"}</span>
          </div>
        </div>
      </div>

      {/* 5. Nº OS da Autorizada e Data de entrada */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_OS_DATA,
          padding: "0 20px",
        }}
      >
        <DivisorFino />
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", gap: 16, marginTop: 18 }}>
          <CampoData icon={<IconDocumento size={20} color="#111111" />} label="Nº OS Autorizada:" valor={numeroOsAutorizada || "—"} />
          <CampoData icon={<IconCalendario size={20} color="#111111" />} label="Data Entrada:" valor={dataEntrada} />
        </div>
      </div>
    </div>
  );
}
