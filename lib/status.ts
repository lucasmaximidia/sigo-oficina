import type {
  OsStatus,
  OsUrgencia,
  ContaStatus,
  AgendaStatus,
  GarantiaStatus,
} from "@/types";

export const osStatusMap: Record<OsStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  aguardando_orcamento: { label: "Aguardando orçamento", variant: "secondary" },
  em_execucao: { label: "Em execução", variant: "info" },
  aguardando_pecas: { label: "Aguardando peças", variant: "warning" },
  aguardando_pagamento: { label: "Aguardando pagamento", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export const osStatusSteps: { value: OsStatus; label: string }[] = [
  { value: "aguardando_orcamento", label: "Aguardando Orçamento" },
  { value: "em_execucao", label: "Em Execução" },
  { value: "aguardando_pecas", label: "Aguardando Peças" },
  { value: "aguardando_pagamento", label: "Pagamento" },
  { value: "finalizado", label: "Finalizado" },
];

export const urgenciaMap: Record<OsUrgencia, { label: string; dotClass: string }> = {
  alta: { label: "Urgente", dotClass: "bg-destructive" },
  media: { label: "Média", dotClass: "bg-warning" },
  baixa: { label: "Baixa", dotClass: "bg-muted-foreground/40" },
};

export const contaStatusMap: Record<ContaStatus, { label: string; variant: "secondary" | "warning" | "success" | "destructive" }> = {
  pendente: { label: "A Vencer", variant: "secondary" },
  pago: { label: "Pago", variant: "success" },
  atrasado: { label: "Atrasado", variant: "destructive" },
};

export const agendaStatusMap: Record<AgendaStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "destructive" }> = {
  agendado: { label: "Agendado", variant: "secondary" },
  confirmado: { label: "Confirmado", variant: "success" },
  aguardando_cliente: { label: "Aguardando Cliente", variant: "warning" },
  concluido: { label: "Concluído", variant: "info" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export const garantiaStatusMap: Record<GarantiaStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  ativa: { label: "Ativa", variant: "success" },
  critica: { label: "Crítica", variant: "warning" },
  expirada: { label: "Expirada", variant: "destructive" },
  sem_garantia: { label: "Sem garantia", variant: "secondary" },
};
