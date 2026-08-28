import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  EtiquetaAutorizadaImage,
  ETIQUETA_AUTORIZADA_LARGURA,
  ETIQUETA_AUTORIZADA_ALTURA,
} from "@/components/ordens-servico/etiqueta-autorizada-image";
import { formatDate, slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OsComRelacoes {
  numero: number;
  data_entrada: string;
  numero_os_autorizada: string | null;
  referencia_autorizada: string | null;
  produto_autorizada: string | null;
  numero_serie_autorizada: string | null;
  clientes: { nome: string; telefone: string | null } | null;
  empresas_autorizadas: { nome: string } | null;
  equipamentos: { tipo: string; marca: string | null; modelo: string | null; numero_serie: string | null } | null;
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
  const { id } = await params;

  const [{ data: os }, { data: config }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select<string, OsComRelacoes>(
        "numero, data_entrada, numero_os_autorizada, referencia_autorizada, produto_autorizada, numero_serie_autorizada, clientes(nome, telefone), empresas_autorizadas(nome), equipamentos(tipo, marca, modelo, numero_serie)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("configuracoes").select("etiqueta_logo_url").eq("id", 1).single(),
  ]);

  if (!os || !config) {
    return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
  }
  if (!os.empresas_autorizadas) {
    return NextResponse.json({ error: "Esta OS não está vinculada a uma empresa autorizada" }, { status: 400 });
  }

  const equipamento = os.equipamentos;
  const produto =
    os.produto_autorizada ||
    (equipamento ? [equipamento.marca, equipamento.modelo].filter(Boolean).join(" ") || equipamento.tipo : "");
  const numeroSerie = os.numero_serie_autorizada || equipamento?.numero_serie || "";

  const [montserratRegular, montserratBold] = await Promise.all([
    loadGoogleFont("Montserrat", 400),
    loadGoogleFont("Montserrat", 700),
  ]);

  const dataHoje = new Date().toISOString().slice(0, 10);
  const clienteSlug = slugify(os.clientes?.nome ?? "cliente") || "cliente";
  const nomeArquivo = `etiqueta-autorizada-${dataHoje}-${clienteSlug}.png`;

  return new ImageResponse(
    EtiquetaAutorizadaImage({
      config,
      empresaNome: os.empresas_autorizadas.nome,
      clienteNome: os.clientes?.nome ?? "Cliente não informado",
      clienteTelefone: os.clientes?.telefone ?? null,
      produto,
      numeroSerie,
      referencia: os.referencia_autorizada ?? "",
      numeroOsAutorizada: os.numero_os_autorizada ?? "",
      dataEntrada: formatDate(os.data_entrada),
    }),
    {
      width: ETIQUETA_AUTORIZADA_LARGURA,
      height: ETIQUETA_AUTORIZADA_ALTURA,
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
