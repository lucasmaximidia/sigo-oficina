import type { EtiquetaAlinhamento } from "@/types";

function alignItemsPara(alinhamento: EtiquetaAlinhamento) {
  return alinhamento === "left" ? "flex-start" : alinhamento === "right" ? "flex-end" : "center";
}

function textAlignPara(alinhamento: EtiquetaAlinhamento) {
  return alinhamento === "left" ? "left" : alinhamento === "right" ? "right" : "center";
}

// Linha genérica de um campo de etiqueta: rótulo pequeno opcional + valor em
// destaque, alinhados conforme a configuração. Compartilhada pelas 3
// etiquetas (peça, OS e autorizada) para que a config de alinhamento/tamanho
// de fonte se comporte de forma idêntica nas três.
export function EtiquetaCampoLinha({
  label,
  valor,
  alinhamento,
  fontSizePx,
}: {
  label?: string;
  valor: string;
  alinhamento: EtiquetaAlinhamento;
  fontSizePx: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: alignItemsPara(alinhamento),
        textAlign: textAlignPara(alinhamento),
        width: "100%",
      }}
    >
      {label && <span style={{ fontSize: 16, color: "#333333" }}>{label}</span>}
      <span style={{ fontSize: fontSizePx, fontWeight: 700, color: "#111111", lineHeight: 1.2 }}>{valor}</span>
    </div>
  );
}

export function EtiquetaDivisorFino() {
  return <div style={{ display: "flex", height: 2, background: "#111111", flexShrink: 0 }} />;
}
