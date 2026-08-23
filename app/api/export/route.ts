import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildCsv, csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TIPOS = ["clientes", "estoque", "contas", "despesas"] as const;
type Tipo = (typeof TIPOS)[number];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo") as Tipo | null;
  if (!tipo || !TIPOS.includes(tipo)) {
    return NextResponse.json({ error: "Parâmetro tipo inválido" }, { status: 400 });
  }

  const dataHoje = new Date().toISOString().slice(0, 10);

  if (tipo === "clientes") {
    const { data } = await supabase
      .from("clientes")
      .select("nome, telefone, email, cpf_cnpj, endereco, bairro, cidade, estado")
      .order("nome", { ascending: true });
    const csv = buildCsv(
      ["Nome", "Telefone", "E-mail", "CPF/CNPJ", "Endereço", "Bairro", "Cidade", "Estado"],
      (data ?? []).map((c) => [c.nome, c.telefone, c.email, c.cpf_cnpj, c.endereco, c.bairro, c.cidade, c.estado])
    );
    return csvResponse(csv, `clientes-${dataHoje}.csv`);
  }

  if (tipo === "estoque") {
    const { data } = await supabase
      .from("pecas")
      .select("nome, codigo, categoria, quantidade, quantidade_minima, preco_custo, preco_venda")
      .order("nome", { ascending: true });
    const csv = buildCsv(
      ["Nome", "Código", "Categoria", "Quantidade", "Quantidade Mínima", "Preço Custo", "Preço Venda"],
      (data ?? []).map((p) => [p.nome, p.codigo, p.categoria, p.quantidade, p.quantidade_minima, p.preco_custo, p.preco_venda])
    );
    return csvResponse(csv, `estoque-${dataHoje}.csv`);
  }

  if (tipo === "contas") {
    const { data } = await supabase
      .from("financeiro_contas")
      .select("descricao, categoria, fornecedor, numero_documento, valor, vencimento, status, pago_em")
      .is("deletado_em", null)
      .order("vencimento", { ascending: true });
    const csv = buildCsv(
      ["Descrição", "Categoria", "Fornecedor", "Nº Documento", "Valor", "Vencimento", "Status", "Pago em"],
      (data ?? []).map((c) => [
        c.descricao,
        c.categoria,
        c.fornecedor,
        c.numero_documento,
        c.valor,
        formatDate(c.vencimento),
        c.status,
        c.pago_em ? formatDate(c.pago_em) : "",
      ])
    );
    return csvResponse(csv, `contas-a-pagar-${dataHoje}.csv`);
  }

  const { data } = await supabase
    .from("financeiro_despesas")
    .select("descricao, categoria, valor, data")
    .is("deletado_em", null)
    .order("data", { ascending: false });
  const csv = buildCsv(
    ["Descrição", "Categoria", "Valor", "Data"],
    (data ?? []).map((d) => [d.descricao, d.categoria, d.valor, formatDate(d.data)])
  );
  return csvResponse(csv, `despesas-${dataHoje}.csv`);
}
