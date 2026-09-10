import { describe, expect, it } from "vitest";
import { cn, dataLembreteVencimento, formatCurrency, formatDate, formatDateTime, formatPhoneBR, slugify } from "./utils";

describe("cn", () => {
  it("mescla classes e resolve conflitos do Tailwind pela última vencendo", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});

// Intl.NumberFormat("pt-BR") separa "R$" do valor com um espaco nao-quebravel
// (U+00A0), nao um espaco comum -- normaliza antes de comparar pra nao
// depender de reproduzir esse caractere invisivel no texto do teste.
function normalizarEspacos(texto: string) {
  return texto.replace(/\s/g, " ");
}

describe("formatCurrency", () => {
  it("formata em reais com 2 casas decimais", () => {
    expect(normalizarEspacos(formatCurrency(1234.5))).toBe("R$ 1.234,50");
  });

  it("formata zero corretamente", () => {
    expect(normalizarEspacos(formatCurrency(0))).toBe("R$ 0,00");
  });

  it("formata valores negativos", () => {
    expect(formatCurrency(-10)).toContain("10,00");
  });
});

describe("formatDate", () => {
  it("interpreta uma data pura (YYYY-MM-DD) no horario local, nao em UTC", () => {
    // Bug que este teste protege: new Date("2026-10-25") vira meia-noite UTC,
    // que em fusos atras de UTC (ex.: Brasil) exibe o dia anterior (24/10).
    expect(formatDate("2026-10-25")).toBe("25/10/2026");
  });

  it("aceita um objeto Date diretamente", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("05/01/2026");
  });
});

describe("formatDateTime", () => {
  it("formata data e hora", () => {
    const resultado = formatDateTime("2026-03-15T14:30:00");
    expect(resultado).toContain("15/03/2026");
    expect(resultado).toContain("14:30");
  });
});

describe("formatPhoneBR", () => {
  it("formata progressivamente enquanto o usuario digita", () => {
    expect(formatPhoneBR("1")).toBe("(1");
    expect(formatPhoneBR("11987")).toBe("(11) 987");
    expect(formatPhoneBR("11987654321")).toBe("(11) 98765-4321");
  });

  it("ignora caracteres nao numericos e limita a 11 digitos", () => {
    expect(formatPhoneBR("(11) 98765-4321-extra")).toBe("(11) 98765-4321");
  });

  it("retorna vazio para entrada vazia", () => {
    expect(formatPhoneBR("")).toBe("");
  });
});

describe("slugify", () => {
  it("remove acentos e espacos", () => {
    expect(slugify("Correção de Válvula")).toBe("correcao-de-valvula");
  });

  it("remove hifens nas pontas", () => {
    expect(slugify("  -teste-  ")).toBe("teste");
  });
});

describe("dataLembreteVencimento", () => {
  it("mantem a data quando o vencimento e dia de semana", () => {
    // 2026-09-10 e uma quinta-feira.
    expect(dataLembreteVencimento("2026-09-10")).toBe("2026-09-10");
  });

  it("antecipa para sexta quando o vencimento cai no sabado", () => {
    // 2026-09-12 e um sabado.
    expect(dataLembreteVencimento("2026-09-12")).toBe("2026-09-11");
  });

  it("antecipa para sexta quando o vencimento cai no domingo", () => {
    // 2026-09-13 e um domingo.
    expect(dataLembreteVencimento("2026-09-13")).toBe("2026-09-11");
  });
});
