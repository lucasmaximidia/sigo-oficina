import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TABELAS = [
  "clientes",
  "equipamentos",
  "lojas_parceiras",
  "pecas",
  "ordens_servico",
  "os_itens",
  "fretes",
  "prestadores_frete",
  "vendas_pdv",
  "venda_itens",
  "venda_pagamentos",
  "financeiro_contas",
  "financeiro_despesas",
  "financeiro_retiradas",
  "orcamentos",
  "orcamento_itens",
  "agenda_eventos",
  "tarefas",
  "configuracoes",
] as const;

export async function GET() {
  const resultados = await Promise.all(TABELAS.map((tabela) => supabase.from(tabela).select("*")));

  const erro = resultados.find((r) => r.error);
  if (erro?.error) {
    return NextResponse.json({ error: erro.error.message }, { status: 500 });
  }

  const tabelasComDados = Object.fromEntries(TABELAS.map((tabela, i) => [tabela, resultados[i].data ?? []]));

  const backup = {
    sistema: "SIGO Oficina",
    geradoEm: new Date().toISOString(),
    tabelas: tabelasComDados,
  };

  const dataHoje = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-sigo-oficina-${dataHoje}.json"`,
    },
  });
}
