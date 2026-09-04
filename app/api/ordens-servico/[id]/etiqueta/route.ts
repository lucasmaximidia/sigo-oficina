import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EtiquetaOsImage, ETIQUETA_LARGURA, ETIQUETA_ALTURA } from "@/components/ordens-servico/etiqueta-image";
import { formatDate, slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsComRelacoes {
  numero: number;
  problema_relatado: string | null;
  data_entrada: string;
  clientes: { nome: string; telefone: string | null } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null } | null;
}

async function loadGoogleFont(family: string, weight: number) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await (
    await fetch(cssUrl, {
      headers: {
        // User-Agent antigo faz o Google Fonts responder com WOFF (em vez de WOFF2), formato que o Satori consegue ler.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
      },
    })
  ).text();
  // O bloco "latin" (unicode-range começando em U+0000-00FF) cobre os acentos
  // do português e é sempre o último @font-face do CSS retornado.
  const matches = [...css.matchAll(/src: url\(([^)]+)\) format\('(?:opentype|truetype|woff)'\)/g)];
  const match = matches.at(-1);
  if (!match) throw new Error("Não foi possível carregar a fonte");
  const response = await fetch(match[1]);
  return response.arrayBuffer();
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const [{ data: os }, { data: config }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsComRelacoes>(
        "numero, problema_relatado, data_entrada, clientes(nome, telefone), equipamentos(tipo, marca, modelo)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("configuracoes").select("etiqueta_logo_url").eq("id", 1).single(),
  ]);

  if (!os || !config) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }

  const equipamento = os.equipamentos;
  const equipamentoDescricao = equipamento
    ? [equipamento.marca, equipamento.modelo].filter(Boolean).join(" ") || equipamento.tipo
    : "Equipamento não informado";

  const [montserratRegular, montserratBold] = await Promise.all([
    loadGoogleFont("Montserrat", 400),
    loadGoogleFont("Montserrat", 700),
  ]);

  const dataHoje = new Date().toISOString().slice(0, 10);
  const clienteSlug = slugify(os.clientes?.nome ?? "cliente") || "cliente";
  const nomeArquivo = `etiqueta-${dataHoje}-${clienteSlug}.png`;

  return new ImageResponse(
    EtiquetaOsImage({
      config,
      numero: os.numero,
      clienteNome: os.clientes?.nome ?? "Cliente não informado",
      clienteTelefone: os.clientes?.telefone ?? null,
      problema: os.problema_relatado || "Sem descrição do problema",
      equipamentoDescricao,
      dataEntrada: formatDate(os.data_entrada),
    }),
    {
      width: ETIQUETA_LARGURA,
      height: ETIQUETA_ALTURA,
      fonts: [
        { name: "Montserrat", data: montserratRegular, weight: 400, style: "normal" },
        { name: "Montserrat", data: montserratBold, weight: 700, style: "normal" },
      ],
      headers: {
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    }
  );
}
