import { IconPessoa, IconTelefone, IconAlerta, IconCaixa, IconCalendario } from "./etiqueta-icons";
import type { Configuracao } from "@/types";

export const ETIQUETA_LARGURA = 500;
export const ETIQUETA_ALTURA = 800;

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 54,
        height: 54,
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
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <IconBadge>{icon}</IconBadge>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 16, color: "#5b6b70" }}>{label}</span>
        <span style={{ fontSize: 29, fontWeight: 700, color: "#111111", lineHeight: 1.15 }}>{valor}</span>
      </div>
    </div>
  );
}

function DivisorSolido() {
  return <div style={{ display: "flex", height: 3, background: "#111111", marginBottom: 16 }} />;
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
  clienteNome,
  clienteTelefone,
  problema,
  equipamentoDescricao,
  dataEntrada,
}: {
  config: Pick<Configuracao, "nome_empresa" | "logo_url" | "telefone" | "etiqueta_subtitulo">;
  clienteNome: string;
  clienteTelefone: string | null;
  problema: string;
  equipamentoDescricao: string;
  dataEntrada: string;
}) {
  return (
    <div
      style={{
        width: ETIQUETA_LARGURA,
        height: ETIQUETA_ALTURA,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "30px 32px",
        fontFamily: "Inter",
        color: "#111111",
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {config.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logo_url} width={68} height={68} style={{ objectFit: "contain", marginBottom: 6 }} alt="" />
        )}
        <span style={{ fontSize: 38, fontWeight: 800, textAlign: "center", lineHeight: 1.08 }}>{config.nome_empresa}</span>
        <span style={{ fontSize: 18, color: "#5b6b70", textAlign: "center" }}>{config.etiqueta_subtitulo}</span>
      </div>

      {/* Cliente */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorSolido />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconPessoa size={32} color="#111111" />
          <span style={{ fontSize: 34, fontWeight: 700 }}>{clienteNome}</span>
        </div>
        {clienteTelefone && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, paddingLeft: 46 }}>
            <IconTelefone size={22} color="#5b6b70" />
            <span style={{ fontSize: 24, color: "#333333" }}>{clienteTelefone}</span>
          </div>
        )}
      </div>

      {/* Problema relatado */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorTracejado />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            background: "#111111",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", marginTop: 3, flexShrink: 0 }}>
            <IconAlerta size={30} color="#ffffff" />
          </div>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>{problema}</span>
        </div>
      </div>

      {/* Produto */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorFino />
        <CampoIcone icon={<IconCaixa size={26} color="#ffffff" />} label="Produto" valor={equipamentoDescricao} />
      </div>

      {/* Data */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <DivisorFino />
        <CampoIcone icon={<IconCalendario size={26} color="#ffffff" />} label="Data" valor={dataEntrada} />
      </div>

      {/* Contato da oficina */}
      {config.telefone && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DivisorFino />
          <CampoIcone icon={<IconTelefone size={26} color="#ffffff" />} label="Oficina" valor={config.telefone} />
        </div>
      )}
    </div>
  );
}
