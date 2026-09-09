import type { ReactNode } from "react";
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
// de fonte se comporte de forma idêntica nas três. Usa flex:1 (em vez de
// width:100%) para poder ocupar metade da linha quando compartilhada com
// outro campo — veja EtiquetaLinha.
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
        flex: 1,
        minWidth: 0,
      }}
    >
      {label && <span style={{ fontSize: 16, color: "#333333" }}>{label}</span>}
      <span style={{ fontSize: fontSizePx, fontWeight: 700, color: "#111111", lineHeight: 1.2 }}>{valor}</span>
    </div>
  );
}

// Uma linha da etiqueta: um único EtiquetaCampoLinha (ocupa a linha toda) ou
// dois lado a lado (cada um com a metade), quando o campo está configurado
// para compartilhar a linha com o próximo.
export function EtiquetaLinha({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: 16 }}>{children}</div>;
}

// Linha fina opcional, usada para separar o cabeçalho do corpo ou dois
// campos entre si — sempre por escolha do usuário na configuração.
export function EtiquetaDivisorFino() {
  return <div style={{ display: "flex", height: 1, background: "#dddddd", flexShrink: 0, width: "100%" }} />;
}
