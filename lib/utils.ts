import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(value: string | Date) {
  // Datas "puras" (YYYY-MM-DD, sem horário) precisam ser interpretadas no
  // horário local — do contrário `new Date("2026-10-25")` vira meia-noite UTC,
  // e em fusos atrás de UTC (ex: Brasil) isso exibe o dia anterior (24/10).
  const date =
    typeof value === "string"
      ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value)
      : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatPhoneBR(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length < 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Data em que o lembrete de uma conta a vencer deve aparecer: no próprio
// vencimento, ou antecipado para a sexta-feira quando o vencimento cai num
// sábado ou domingo (o estabelecimento não abre no fim de semana).
export function dataLembreteVencimento(vencimentoIso: string): string {
  const data = new Date(`${vencimentoIso}T00:00:00`);
  const diaSemana = data.getDay();
  if (diaSemana === 6) data.setDate(data.getDate() - 1);
  else if (diaSemana === 0) data.setDate(data.getDate() - 2);
  return data.toISOString().slice(0, 10);
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
