// Pinta o emblema do veículo com a cor real cadastrada, pra cada card/painel
// ficar visualmente diferente e reconhecível à primeira vista — cai pro
// gradiente da marca quando a cor não é reconhecida ou não foi informada.
// Módulo plano (sem "use client") pra poder ser usado tanto em componentes
// client (VeiculoCard) quanto em componentes server (LocacaoPainel).
export const CORES_VEICULO: Record<string, { bg: string; fg: string }> = {
  preto: { bg: "#111827", fg: "#ffffff" },
  preta: { bg: "#111827", fg: "#ffffff" },
  branco: { bg: "#f1f5f9", fg: "#334155" },
  branca: { bg: "#f1f5f9", fg: "#334155" },
  cinza: { bg: "#6b7280", fg: "#ffffff" },
  grafite: { bg: "#374151", fg: "#ffffff" },
  prata: { bg: "#94a3b8", fg: "#1e293b" },
  vermelho: { bg: "#dc2626", fg: "#ffffff" },
  vermelha: { bg: "#dc2626", fg: "#ffffff" },
  azul: { bg: "#2563eb", fg: "#ffffff" },
  verde: { bg: "#16a34a", fg: "#ffffff" },
  amarelo: { bg: "#eab308", fg: "#422006" },
  amarela: { bg: "#eab308", fg: "#422006" },
  laranja: { bg: "#ea580c", fg: "#ffffff" },
  roxo: { bg: "#9333ea", fg: "#ffffff" },
  roxa: { bg: "#9333ea", fg: "#ffffff" },
  rosa: { bg: "#ec4899", fg: "#ffffff" },
  marrom: { bg: "#78350f", fg: "#ffffff" },
  dourado: { bg: "#ca8a04", fg: "#422006" },
  dourada: { bg: "#ca8a04", fg: "#422006" },
};

export function corVeiculo(cor: string | null) {
  if (!cor) return null;
  const chave = cor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)[0];
  return CORES_VEICULO[chave] ?? null;
}
