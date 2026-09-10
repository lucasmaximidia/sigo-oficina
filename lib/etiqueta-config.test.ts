import { describe, expect, it } from "vitest";
import { agruparCamposEmLinhas, CONFIG_PADRAO, normalizarEtiquetaConfig } from "./etiqueta-config";
import type { EtiquetaCampoConfig } from "@/types";

function campo(overrides: Partial<EtiquetaCampoConfig> & { id: string }): EtiquetaCampoConfig {
  return {
    visivel: true,
    alinhamento: "left",
    tamanhoFonte: "media",
    compartilharLinha: false,
    mostrarDivisorDepois: false,
    espacamentoDepoisPx: 18,
    ...overrides,
  };
}

describe("normalizarEtiquetaConfig", () => {
  it("retorna a config padrão quando não há config salva", () => {
    expect(normalizarEtiquetaConfig("peca", null)).toEqual(CONFIG_PADRAO.peca);
  });

  it("preenche campos faltantes (config antiga, com menos campos que o catálogo atual)", () => {
    const configAntiga = {
      alturaMm: 30,
      mostrarLogo: true,
      logoAlturaPx: 72,
      mostrarDivisorCabecalho: false,
      campos: [campo({ id: "nome" })],
    };
    const resultado = normalizarEtiquetaConfig("peca", configAntiga);
    const idsResultado = resultado.campos.map((c) => c.id);
    // Todo o catálogo de "peca" deve estar presente, não só o campo salvo.
    expect(idsResultado).toEqual(expect.arrayContaining(["nome", "codigo", "preco_venda"]));
    expect(resultado.campos).toHaveLength(3);
  });

  it("migra um campo salvo sem espacamentoDepoisPx (config de antes dessa feature)", () => {
    const campoSemEspacamento = { ...campo({ id: "nome" }) } as Partial<EtiquetaCampoConfig>;
    delete campoSemEspacamento.espacamentoDepoisPx;

    const configAntiga = {
      alturaMm: 30,
      mostrarLogo: true,
      logoAlturaPx: 72,
      mostrarDivisorCabecalho: false,
      campos: [campoSemEspacamento as EtiquetaCampoConfig],
    };
    const resultado = normalizarEtiquetaConfig("peca", configAntiga);
    const campoNome = resultado.campos.find((c) => c.id === "nome");
    // Deve herdar o espaçamento padrão daquele campo específico (12px em peça),
    // não um valor genérico fixo.
    expect(campoNome?.espacamentoDepoisPx).toBe(CONFIG_PADRAO.peca.campos[0].espacamentoDepoisPx);
  });

  it("descarta campos que não existem mais no catálogo", () => {
    const configComCampoObsoleto = {
      alturaMm: 30,
      mostrarLogo: true,
      logoAlturaPx: 72,
      mostrarDivisorCabecalho: false,
      campos: [campo({ id: "nome" }), campo({ id: "campo_removido_do_catalogo" })],
    };
    const resultado = normalizarEtiquetaConfig("peca", configComCampoObsoleto);
    expect(resultado.campos.map((c) => c.id)).not.toContain("campo_removido_do_catalogo");
  });

  it("preserva a ordem e os valores dos campos já configurados", () => {
    const configPersonalizada = {
      ...CONFIG_PADRAO.peca,
      campos: [
        campo({ id: "preco_venda", alinhamento: "center" }),
        campo({ id: "nome", tamanhoFonte: "grande" }),
        campo({ id: "codigo" }),
      ],
    };
    const resultado = normalizarEtiquetaConfig("peca", configPersonalizada);
    expect(resultado.campos.map((c) => c.id)).toEqual(["preco_venda", "nome", "codigo"]);
    expect(resultado.campos[1].tamanhoFonte).toBe("grande");
  });
});

describe("agruparCamposEmLinhas", () => {
  it("cada campo forma sua própria linha por padrão", () => {
    const campos = [campo({ id: "a" }), campo({ id: "b" })];
    expect(agruparCamposEmLinhas(campos)).toEqual([[campos[0]], [campos[1]]]);
  });

  it("agrupa um campo com compartilharLinha junto ao próximo", () => {
    const a = campo({ id: "a", compartilharLinha: true });
    const b = campo({ id: "b" });
    const c = campo({ id: "c" });
    expect(agruparCamposEmLinhas([a, b, c])).toEqual([[a, b], [c]]);
  });

  it("não agrupa o último campo mesmo com compartilharLinha (não há próximo)", () => {
    const a = campo({ id: "a", compartilharLinha: true });
    expect(agruparCamposEmLinhas([a])).toEqual([[a]]);
  });

  it("opera sobre a lista já filtrada — um campo oculto nunca aparece nem forma par", () => {
    // agruparCamposEmLinhas só recebe campos visíveis; se o campo do meio foi
    // ocultado antes da chamada, o "próximo" de A passa a ser C.
    const a = campo({ id: "a", compartilharLinha: true });
    const c = campo({ id: "c" });
    expect(agruparCamposEmLinhas([a, c])).toEqual([[a, c]]);
  });
});
