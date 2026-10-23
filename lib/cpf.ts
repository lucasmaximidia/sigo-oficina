// Validação de CPF pelo algoritmo oficial dos dígitos verificadores. Exclui
// explicitamente sequências de dígito repetido (111.111.111-11, 000.000.000-00
// etc.): matematicamente elas passam no cálculo dos dígitos verificadores, mas
// nunca são emitidas como CPF real — por isso todo validador precisa excluir
// essa lista à parte, não só rodar a conta.
export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base: string) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * (base.length + 1 - i);
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(digitos.slice(0, 9));
  if (primeiroDigito !== parseInt(digitos[9], 10)) return false;

  const segundoDigito = calcularDigito(digitos.slice(0, 10));
  if (segundoDigito !== parseInt(digitos[10], 10)) return false;

  return true;
}

// Validação de CNPJ pelo algoritmo oficial dos dígitos verificadores (pesos
// fixos 5,4,3,2,9,8,7,6,5,4,3,2 pro primeiro dígito, com um 6 extra na frente
// pro segundo) — mesmo cuidado do cpfValido() acima com sequências de dígito
// repetido, que passam na conta mas nunca são emitidas de verdade.
export function cnpjValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split("").reduce((acc, digito, i) => acc + parseInt(digito, 10) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(digitos.slice(0, 12));
  if (primeiroDigito !== parseInt(digitos[12], 10)) return false;

  const segundoDigito = calcularDigito(digitos.slice(0, 13));
  if (segundoDigito !== parseInt(digitos[13], 10)) return false;

  return true;
}

// Aceita o mesmo campo "CPF/CNPJ" (um único input de texto, como no cadastro
// geral de clientes da oficina) e valida pelo formato certo de acordo com a
// quantidade de dígitos: 11 é CPF, 14 é CNPJ, qualquer outra quantidade é
// inválida de cara.
export function cpfCnpjValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 11) return cpfValido(digitos);
  if (digitos.length === 14) return cnpjValido(digitos);
  return false;
}
