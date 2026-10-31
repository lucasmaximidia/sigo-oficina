import type { PessoalItemSecao, PessoalCartaoCategoria, PessoalRendaCategoria } from "@/types";

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
};

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
