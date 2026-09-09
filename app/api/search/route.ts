import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export interface SearchResultado {
  tipo: "cliente" | "os" | "peca";
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ resultados: [] });

  const numero = Number(q.replace(/\D/g, ""));

  const [{ data: clientes }, { data: ordens }, { data: pecas }] = await Promise.all([
    supabase.from("clientes").select("id, nome, telefone").or(`nome.ilike.%${q}%,telefone.ilike.%${q}%`).limit(5),
    Number.isFinite(numero) && numero > 0
      ? supabase
          .from("ordens_servico")
          .select("id, numero, clientes(nome)")
          .eq("numero", numero)
          .limit(5)
      : Promise.resolve({ data: [] as { id: string; numero: number; clientes: { nome: string } | null }[] }),
    supabase.from("pecas").select("id, nome, codigo").or(`nome.ilike.%${q}%,codigo.ilike.%${q}%`).limit(5),
  ]);

  const resultados: SearchResultado[] = [
    ...(clientes ?? []).map((c) => ({
      tipo: "cliente" as const,
      id: c.id,
      titulo: c.nome,
      subtitulo: c.telefone ?? "Cliente",
      href: `/clientes?id=${c.id}`,
    })),
    ...(ordens ?? []).map((os) => {
      const cliente = Array.isArray(os.clientes) ? os.clientes[0] : os.clientes;
      return {
        tipo: "os" as const,
        id: os.id,
        titulo: `OS #${String(os.numero).padStart(4, "0")}`,
        subtitulo: cliente?.nome ?? "Ordem de serviço",
        href: `/ordens-servico/${os.id}`,
      };
    }),
    ...(pecas ?? []).map((p) => ({
      tipo: "peca" as const,
      id: p.id,
      titulo: p.nome,
      subtitulo: p.codigo ? `Código ${p.codigo}` : "Peça em estoque",
      href: `/estoque`,
    })),
  ];

  return NextResponse.json({ resultados });
}
