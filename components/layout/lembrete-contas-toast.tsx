"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ContaLembrete {
  id: string;
  descricao: string;
  vencimento: string;
  valor: number;
}

export function LembreteContasToast({ contas }: { contas: ContaLembrete[] }) {
  const router = useRouter();
  const disparado = useRef(false);

  useEffect(() => {
    if (disparado.current || contas.length === 0) return;
    disparado.current = true;

    const totalValor = contas.reduce((acc, c) => acc + c.valor, 0);
    const titulo = contas.length === 1 ? "Uma conta vence hoje" : `${contas.length} contas vencem hoje`;
    const descricao =
      contas.length === 1
        ? `${contas[0].descricao} · Venc. ${formatDate(contas[0].vencimento)} · ${formatCurrency(contas[0].valor)}`
        : `Total de ${formatCurrency(totalValor)} em contas a pagar.`;

    toast.warning(titulo, {
      description: descricao,
      duration: 10000,
      action: {
        label: "Ver contas",
        onClick: () => router.push("/financeiro"),
      },
    });
  }, [contas, router]);

  return null;
}
