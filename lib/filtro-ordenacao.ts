export type Ordenacao = "data_desc" | "data_asc" | "valor_desc" | "valor_asc";

export const opcoesOrdenacaoPadrao: { value: Ordenacao; label: string }[] = [
  { value: "data_desc", label: "Data (mais recente)" },
  { value: "data_asc", label: "Data (mais antiga)" },
  { value: "valor_desc", label: "Valor (maior)" },
  { value: "valor_asc", label: "Valor (menor)" },
];

// Filtra por período (comparando strings "YYYY-MM-DD") e ordena por data ou
// valor. Genérico o suficiente pra reaproveitar em qualquer lista do
// Financeiro — cada uma só precisa dizer como ler a data e o valor do item.
export function filtrarEOrdenar<T>(
  itens: T[],
  getData: (item: T) => string,
  getValor: (item: T) => number,
  ordenacao: Ordenacao,
  periodoInicio: string,
  periodoFim: string
): T[] {
  let filtrados = itens;
  if (periodoInicio) filtrados = filtrados.filter((item) => getData(item) >= periodoInicio);
  if (periodoFim) filtrados = filtrados.filter((item) => getData(item) <= periodoFim);

  return [...filtrados].sort((a, b) => {
    switch (ordenacao) {
      case "data_asc":
        return getData(a).localeCompare(getData(b));
      case "valor_desc":
        return getValor(b) - getValor(a);
      case "valor_asc":
        return getValor(a) - getValor(b);
      case "data_desc":
      default:
        return getData(b).localeCompare(getData(a));
    }
  });
}
