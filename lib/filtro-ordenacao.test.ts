import { describe, expect, it } from "vitest";
import { filtrarEOrdenar } from "./filtro-ordenacao";

interface Item {
  id: string;
  data: string;
  valor: number;
}

const itens: Item[] = [
  { id: "a", data: "2026-01-10", valor: 100 },
  { id: "b", data: "2026-02-05", valor: 50 },
  { id: "c", data: "2026-03-20", valor: 300 },
];

function ordenarPor(itens: Item[], ordenacao: Parameters<typeof filtrarEOrdenar>[3]) {
  return filtrarEOrdenar(itens, (i) => i.data, (i) => i.valor, ordenacao, "", "").map((i) => i.id);
}

describe("filtrarEOrdenar", () => {
  it("ordena por data decrescente (padrão)", () => {
    expect(ordenarPor(itens, "data_desc")).toEqual(["c", "b", "a"]);
  });

  it("ordena por data crescente", () => {
    expect(ordenarPor(itens, "data_asc")).toEqual(["a", "b", "c"]);
  });

  it("ordena por valor decrescente", () => {
    expect(ordenarPor(itens, "valor_desc")).toEqual(["c", "a", "b"]);
  });

  it("ordena por valor crescente", () => {
    expect(ordenarPor(itens, "valor_asc")).toEqual(["b", "a", "c"]);
  });

  it("filtra por período (início e fim inclusivos)", () => {
    const resultado = filtrarEOrdenar(itens, (i) => i.data, (i) => i.valor, "data_asc", "2026-02-01", "2026-02-28");
    expect(resultado.map((i) => i.id)).toEqual(["b"]);
  });

  it("não filtra quando período está vazio", () => {
    const resultado = filtrarEOrdenar(itens, (i) => i.data, (i) => i.valor, "data_asc", "", "");
    expect(resultado).toHaveLength(3);
  });

  it("não modifica o array original (retorna uma cópia ordenada)", () => {
    const original = [...itens];
    filtrarEOrdenar(itens, (i) => i.data, (i) => i.valor, "valor_desc", "", "");
    expect(itens).toEqual(original);
  });
});
