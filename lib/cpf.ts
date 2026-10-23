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
