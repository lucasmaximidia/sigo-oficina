import { IconCalendario, IconDocumento, IconLavadora } from "./etiqueta-icons";
import type { Configuracao } from "@/types";

export const ETIQUETA_LARGURA = 500;
export const ETIQUETA_ALTURA = 800;

// Grid fixo: cada zona tem uma altura exata e a soma bate certinho com
// ETIQUETA_ALTURA, preenchendo a etiqueta de ponta a ponta sem sobra.
const ALTURA_CABECALHO = 240;
const ALTURA_CLIENTE = 140;
const ALTURA_EQUIPAMENTO = 120;
const ALTURA_DEFEITO = 200;
const ALTURA_DATA_OS = 100;

function CampoData({
  icon,
  label,
  valor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 18, color: "#333333" }}>{label}</span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 700, color: "#111111", lineHeight: 1.15 }}>{valor}</span>
    </div>
  );
}

function DivisorFino() {
  return <div style={{ display: "flex", height: 2, background: "#111111" }} />;
}

export function EtiquetaOsImage({
  config,
  numero,
  clienteNome,
  clienteTelefone,
  problema,
  equipamentoDescricao,
  dataEntrada,
}: {
  config: Pick<Configuracao, "etiqueta_logo_url">;
  numero: number;
  clienteNome: string;
  clienteTelefone: string | null;
  problema: string;
  equipamentoDescricao: string;
  dataEntrada: string;
}) {
  const numeroOs = `OS-${String(numero).padStart(4, "0")}`;

  return (
    <div
      style={{
        width: ETIQUETA_LARGURA,
        height: ETIQUETA_ALTURA,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        fontFamily: "Inter",
        color: "#111111",
      }}
    >
      {/* 1. Cabeçalho: só a imagem enviada, sem texto sobreposto */}
      <div
        style={{
          display: "flex",
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
            width={ETIQUETA_LARGURA}
            height={ALTURA_CABECALHO}
            style={{ objectFit: "contain" }}
            alt=""
          />
        ) : (
          <IconLavadora size={90} color="#cccccc" />
        )}
      </div>

      {/* 2. Cliente: nome e telefone dele */}
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
          <span style={{ fontSize: 34, fontWeight: 700 }}>{clienteNome}</span>
          {clienteTelefone && <span style={{ fontSize: 26, color: "#333333", marginTop: 6 }}>{clienteTelefone}</span>}
        </div>
      </div>

      {/* 3. Equipamento */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          height: ALTURA_EQUIPAMENTO,
          padding: "0 20px",
        }}
      >
        <span style={{ fontSize: 20, color: "#333333" }}>Equipamento:</span>
        <span style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{equipamentoDescricao}</span>
      </div>

      {/* 4. Defeito relatado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_DEFEITO,
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            border: "2px solid #111111",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <span style={{ fontSize: 20, color: "#333333" }}>Defeito Relatado:</span>
          <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{problema}</span>
        </div>
      </div>

      {/* 5. Data de entrada e Nº O.S. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: ALTURA_DATA_OS,
          padding: "0 20px",
        }}
      >
        <DivisorFino />
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", gap: 16, marginTop: 18 }}>
          <CampoData
            icon={<IconCalendario size={20} color="#111111" />}
            label="Data Entrada:"
            valor={dataEntrada}
          />
          <CampoData icon={<IconDocumento size={20} color="#111111" />} label="Nº O.S.:" valor={numeroOs} />
        </div>
      </div>
    </div>
  );
}
