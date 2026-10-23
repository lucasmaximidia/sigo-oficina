import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const FUSO_BRASIL = "America/Sao_Paulo";

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
  // Datas "puras" (YYYY-MM-DD, sem horário) são ancoradas explicitamente à
  // meia-noite de Brasília (-03:00), em vez de depender do fuso do runtime —
  // isso roda tanto no navegador quanto no servidor (UTC), e combinado com o
  // timeZone fixo abaixo garante o mesmo dia nos dois lugares. Sem a âncora
  // explícita, `new Date("2026-10-25")` vira meia-noite UTC, que ao formatar
  // já fixando o fuso do Brasil viraria 24/10 (21h do dia anterior).
  const date =
    typeof value === "string"
      ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00-03:00` : value)
      : value;
  // timeZone fixo: sem isso, um timestamp real (não uma data pura) formatado
  // no servidor mostraria o dia em UTC, que diverge do dia no Brasil das
  // ~21h à meia-noite (horário de Brasília).
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO_BRASIL,
  }).format(date);
}

// Data (YYYY-MM-DD) de um instante no fuso do Brasil — nunca faça
// `algumTimestamptz.slice(0, 10)` pra extrair "a data" de um timestamp real:
// isso pega o dia em UTC, que diverge do dia no Brasil todo dia das ~21h à
// meia-noite (horário de Brasília) — ex.: uma venda feita às 23h vira
// "amanhã" nesse fatiamento ingênuo.
export function dataBR(instante: Date | string = new Date()): string {
  const date = typeof instante === "string" ? new Date(instante) : instante;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_BRASIL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// "Hoje" no fuso do Brasil, não no fuso do servidor — mesmo motivo do
// dataBR() acima, aplicado ao instante atual.
export function hojeBR(): string {
  return dataBR();
}

// Ano/mês/dia atuais no fuso do Brasil (mês 1-indexado), para cálculos de
// "mês atual" — mesmo motivo do hojeBR() acima.
export function agoraBR(): { ano: number; mes: number; dia: number } {
  const [ano, mes, dia] = hojeBR().split("-").map(Number);
  return { ano, mes, dia };
}

// Meia-noite de um dia (YYYY-MM-DD) em Brasília, como instante UTC — para
// filtrar colunas timestamptz pelo dia civil do Brasil. Um literal
// "YYYY-MM-DDT00:00:00" sem offset enviado ao Postgres é interpretado no
// fuso UTC da sessão, não no fuso do Brasil, o que desalinha a janela do dia
// em 3 horas (ex.: um evento das 22h de hoje cairia em "amanhã").
export function inicioDiaBR(dataIso: string): string {
  return new Date(`${dataIso}T00:00:00-03:00`).toISOString();
}

// Combina uma data "YYYY-MM-DD" com um horário "HH:mm" (de <input
// type="time">, por exemplo), ancorados explicitamente ao fuso de Brasília
// (-03:00), devolvendo o instante UTC correspondente — mesmo motivo do
// inicioDiaBR() acima: sem a âncora, o literal seria interpretado no fuso do
// runtime (UTC na Vercel), e um evento marcado pra 09:00 seria gravado como
// se fosse 09:00 UTC (06:00 em Brasília).
export function dataHoraBR(dataIso: string, hora: string): string {
  return new Date(`${dataIso}T${hora}:00-03:00`).toISOString();
}

// Soma (ou subtrai) dias a uma data "YYYY-MM-DD" em aritmética de calendário
// pura (via Date.UTC), sem depender do fuso do runtime — ao contrário de
// `Date.setDate()` num Date "local", que pode cair num dia diferente
// dependendo do fuso em que o processo está rodando.
export function diasAPartirDe(dataIso: string, dias: number): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

// Timestamp atual (ms). Só existe pra isolar a chamada impura `Date.now()`
// para fora do corpo de Server Components — chamá-la direto ali dispara o
// lint de pureza do React (react-hooks/purity).
export function agoraMs(): number {
  return Date.now();
}

// Hora atual (HH:mm) no fuso do Brasil — mesmo motivo do hojeBR(), usado
// pra comparar com o horário configurado de cada aviso push (ver
// lib/notificacoes-diarias.ts). hourCycle "h23" evita o bug conhecido de
// `hour12: false` devolver "24" em vez de "00" à meia-noite.
export function horaBR(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_BRASIL,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hora = partes.find((p) => p.type === "hour")?.value ?? "00";
  const minuto = partes.find((p) => p.type === "minute")?.value ?? "00";
  return `${hora}:${minuto}`;
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
  // Mesmo motivo do timeZone fixo em formatDate(): sem isso, formatado no
  // servidor (UTC) mostra dia/hora em UTC em vez de horário de Brasília.
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO_BRASIL,
  }).format(date);
}

// Identificação amigável de um dispositivo a partir do seu user-agent, pra
// listar assinaturas de notificação push sem mostrar nada técnico — é uma
// leitura aproximada (suficiente pra diferenciar "o celular" do
// "computador da loja"), não uma detecção precisa de navegador.
export function descreverDispositivo(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo";
  const ua = userAgent;
  let sistema = "Dispositivo";
  if (/iphone/i.test(ua)) sistema = "iPhone";
  else if (/ipad/i.test(ua)) sistema = "iPad";
  else if (/android/i.test(ua)) sistema = "Android";
  else if (/mac os/i.test(ua)) sistema = "Mac";
  else if (/windows/i.test(ua)) sistema = "Windows";
  else if (/linux/i.test(ua)) sistema = "Linux";

  let navegador = "";
  if (/edg\//i.test(ua)) navegador = "Edge";
  else if (/chrome\//i.test(ua)) navegador = "Chrome";
  else if (/crios\//i.test(ua)) navegador = "Chrome";
  else if (/firefox\//i.test(ua)) navegador = "Firefox";
  else if (/safari\//i.test(ua)) navegador = "Safari";

  return navegador ? `${sistema} · ${navegador}` : sistema;
}
