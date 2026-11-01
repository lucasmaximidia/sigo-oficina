// Aritmética de calendário sobre strings "YYYY-MM-01" — separado de
// lib/pessoal-actions.ts porque um arquivo "use server" só pode exportar
// funções async (toda função aqui é síncrona).
import { agoraBR } from "@/lib/utils";

export function somarMeses(mes: string, n: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const d = new Date(ano, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function mesAtualStr(): string {
  const { ano, mes } = agoraBR();
  return `${ano}-${String(mes).padStart(2, "0")}-01`;
}
