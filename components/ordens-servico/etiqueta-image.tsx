import { IconPessoa, IconTelefone, IconAlerta, IconCaixa, IconCalendario, IconDocumento } from "./etiqueta-icons";
import type { Configuracao } from "@/types";

export const ETIQUETA_LARGURA = 500;
export const ETIQUETA_ALTURA = 800;

function IconBadge({ children, size = 58 }: { children: React.ReactNode; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 12,
        background: "#000000",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function CampoIcone({
  icon,
  label,
  valor,
  valorSize = 28,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
  valorSize?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, width: "100%", minWidth: 0 }}>
      <IconBadge>{icon}</IconBadge>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 4 }}>
        <span style={{ fontSize: 16, color: "#5b6b70" }}>{label}</span>
        <span style={{ fontSize: valorSize, fontWeight: 700, color: "#111111", lineHeight: 1.2 }}>{valor}</span>
      </div>
    </div>
  );
}

function DivisorTracejado() {
  return (
    <div
      style={{
        display: "flex",
        height: 0,
        borderTop: "3px dashed #999999",
        marginBottom: 18,
      }}
    />
  );
}

function DivisorFino() {
  return <div style={{ display: "flex", height: 1, background: "#dddddd", marginBottom: 16 }} />;
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
        justifyContent: "space-between",
        gap: 22,
        background: "#ffffff",
        padding: "34px 30px",
        fontFamily: "Inter",
        color: "#111111",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {config.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logo_url} width={64} height={64} style={{ objectFit: "contain", flexShrink: 0 }} alt="" />
          ) : (
            <IconBadge size={64}>
              <IconCaixa size={32} color="#ffffff" />
            </IconBadge>
          )}
          <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.08, flex: 1 }}>{config.nome_empresa}</span>
        </div>
        <span style={{ fontSize: 19, color: "#5b6b70", textAlign: "center", marginTop: 12 }}>
          — {config.etiqueta_subtitulo} —
        </span>
        <div style={{ display: "flex", height: 3, background: "#111111", marginTop: 18 }} />
      </div>

      {/* Cliente */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconPessoa size={36} color="#111111" />
          <span style={{ fontSize: 38, fontWeight: 700 }}>{clienteNome}</span>
        </div>
        {clienteTelefone && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, paddingLeft: 50 }}>
            <IconTelefone size={24} color="#5b6b70" />
            <span style={{ fontSize: 27, color: "#333333" }}>{clienteTelefone}</span>
          </div>
        )}
      </div>

      {/* Problema relatado */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorTracejado />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: "#111111",
            borderRadius: 12,
            padding: "18px 16px",
          }}
        >
          <div style={{ display: "flex", flexShrink: 0 }}>
            <IconAlerta size={34} color="#ffffff" />
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", lineHeight: 1.25, textAlign: "center" }}>
            {problema}
          </span>
        </div>
      </div>

      {/* Produto */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorFino />
        <CampoIcone icon={<IconCaixa size={28} color="#ffffff" />} label="Produto" valor={equipamentoDescricao} />
      </div>

      {/* Data e Nº O.S. */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorFino />
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 16 }}>
          <CampoIcone icon={<IconCalendario size={24} color="#ffffff" />} label="Data" valor={dataEntrada} valorSize={23} />
          <div style={{ display: "flex", width: 1, alignSelf: "stretch", background: "#dddddd" }} />
          <CampoIcone icon={<IconDocumento size={24} color="#ffffff" />} label="Nº O.S." valor={numeroOs} valorSize={23} />
        </div>
      </div>

      {/* Contato da oficina */}
      {config.telefone && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DivisorFino />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <IconTelefone size={34} color="#111111" />
            <span style={{ fontSize: 38, fontWeight: 800 }}>{config.telefone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
