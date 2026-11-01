import type { PessoalItemSecao, PessoalCartaoCategoria, PessoalRendaCategoria, PessoalRenda } from "@/types";

export const PESSOAL_SECAO_LABEL: Record<PessoalItemSecao, string> = {
  fixa: "Contas Fixas",
  carro: "Carro",
  dizimo: "Dízimo e Oferta",
  extra: "Contas Extras",
};

export const PESSOAL_CARTAO_CATEGORIA_LABEL: Record<PessoalCartaoCategoria, string> = {
  alimentacao: "Alimentação",
  carro: "Carro",
  casa: "Casa",
  celular: "Celular",
  farmacia: "Farmácia",
  feira: "Feira",
  lanches: "Lanches",
  loja: "Loja",
  oficina: "Oficina",
  igreja: "Igreja",
  outra_pessoa: "Outra Pessoa",
  outros: "Outros",
  voltcity: "VoltCity",
};

// Categorias de lançamento de cartão que representam gasto feito no cartão
// pessoal por conta de terceiros (oficina, VoltCity, empréstimo a alguém) —
// valores que devem ser repassados de volta.
export const CATEGORIAS_A_RECEBER: PessoalCartaoCategoria[] = ["oficina", "voltcity", "outra_pessoa"];

// Descrição fixa da renda "Terceiros" que soma automaticamente o que já foi
// repassado de volta via gastos no cartão (ver sincronizarRepasseCartao em
// pessoal-actions) — usada pra não confundir essa linha automática com um
// recebível avulso que o dono lança na mão (ex: taxa de energia da oficina).
export const DESCRICAO_REPASSE_CARTAO = "CONTAS PAGAS POR TERCEIROS";

export const PESSOAL_RENDA_CATEGORIA_LABEL: Record<PessoalRendaCategoria, string> = {
  salario_lucas: "Salário Lucas",
  salario_jessica: "Salário Jéssica",
  terceiros: "Terceiros",
  outro: "Outro",
};

export const MESES_LABEL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function labelMes(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  return `${MESES_LABEL[mesNum - 1]} de ${ano}`;
}

function normalizarTexto(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Dízimo é 10% do salário de cada um — Lucas sobre o próprio salário,
// Jéssica sobre o dela. Essa função só calcula a sugestão; o lançamento e a
// confirmação continuam manuais (o dono pode ajustar o valor).
export function calcularDizimo(valorSalario: number): number {
  return Math.round(valorSalario * 10) / 100;
}

// A partir da descrição do item de dízimo ("LUCAS"/"JÉSSICA"), acha a linha
// de renda correspondente (salario_lucas/salario_jessica) daquele mês.
export function salarioDoDizimo(renda: PessoalRenda[], descricaoItem: string): PessoalRenda | null {
  const normalizado = normalizarTexto(descricaoItem);
  const categoria: PessoalRendaCategoria | null = normalizado.includes("LUCAS")
    ? "salario_lucas"
    : normalizado.includes("JESSICA")
      ? "salario_jessica"
      : null;
  if (!categoria) return null;
  return renda.find((r) => r.categoria === categoria) ?? null;
}
