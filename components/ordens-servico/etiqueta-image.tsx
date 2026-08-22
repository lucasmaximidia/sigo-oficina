import { IconTelefone, IconCalendario, IconDocumento, IconLavadora } from "./etiqueta-icons";
import type { Configuracao } from "@/types";

export const ETIQUETA_LARGURA = 500;
export const ETIQUETA_ALTURA = 800;

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
  config: Pick<Configuracao, "nome_empresa" | "logo_url" | "telefone" | "etiqueta_subtitulo">;
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
        justifyContent: "center",
        gap: 34,
        background: "#ffffff",
        padding: "40px 34px",
        fontFamily: "Inter",
        color: "#111111",
      }}
    >
      {/* Cabeçalho: detalhes da oficina (logo, nome, subtítulo e telefone) */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {config.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logo_url} width={84} height={84} style={{ objectFit: "contain", flexShrink: 0 }} alt="" />
          ) : (
            <div style={{ display: "flex", flexShrink: 0 }}>
              <IconLavadora size={84} color="#111111" />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.12 }}>{config.nome_empresa}</span>
            <span style={{ fontSize: 17, color: "#333333", marginTop: 2 }}>{config.etiqueta_subtitulo}</span>
            {config.telefone && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <IconTelefone size={20} color="#111111" />
                <span style={{ fontSize: 24, fontWeight: 700 }}>{config.telefone}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", height: 2, background: "#111111", marginTop: 20 }} />
      </div>

      {/* Cliente */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 700 }}>{clienteNome}</span>
        {clienteTelefone && <span style={{ fontSize: 26, color: "#333333", marginTop: 6 }}>{clienteTelefone}</span>}
      </div>

      {/* Equipamento */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span style={{ fontSize: 20, color: "#333333" }}>Equipamento:</span>
        <span style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{equipamentoDescricao}</span>
      </div>

      {/* Defeito relatado */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          border: "2px solid #111111",
          borderRadius: 12,
          padding: "18px 20px",
        }}
      >
        <span style={{ fontSize: 20, color: "#333333" }}>Defeito Relatado:</span>
        <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{problema}</span>
      </div>

      {/* Data de entrada e Nº O.S. */}
      <div style={{ display: "flex", flexDirection: "column" }}>
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
