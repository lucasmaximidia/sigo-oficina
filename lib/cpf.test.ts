import { describe, expect, it } from "vitest";
import { cpfValido, cnpjValido, cpfCnpjValido } from "./cpf";

describe("cpfValido", () => {
  it("aceita um CPF real válido, formatado ou não", () => {
    expect(cpfValido("111.444.777-35")).toBe(true);
    expect(cpfValido("11144477735")).toBe(true);
  });

  it("rejeita dígitos verificadores errados", () => {
    expect(cpfValido("111.444.777-36")).toBe(false);
  });

  it("rejeita sequências de dígito repetido mesmo passando na conta", () => {
    expect(cpfValido("111.111.111-11")).toBe(false);
    expect(cpfValido("00000000000")).toBe(false);
    expect(cpfValido("99999999999")).toBe(false);
  });

  it("rejeita tamanho errado", () => {
    expect(cpfValido("1234567890")).toBe(false);
    expect(cpfValido("123456789012")).toBe(false);
    expect(cpfValido("")).toBe(false);
  });
});

describe("cnpjValido", () => {
  it("aceita um CNPJ real válido, formatado ou não", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
  });

  it("rejeita dígitos verificadores errados", () => {
    expect(cnpjValido("11222333000180")).toBe(false);
  });

  it("rejeita sequências de dígito repetido mesmo passando na conta", () => {
    expect(cnpjValido("11111111111111")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
  });

  it("rejeita tamanho errado", () => {
    expect(cnpjValido("1234567890123")).toBe(false);
    expect(cnpjValido("123456789012345")).toBe(false);
    expect(cnpjValido("")).toBe(false);
  });
});

describe("cpfCnpjValido", () => {
  it("valida como CPF quando tem 11 dígitos", () => {
    expect(cpfCnpjValido("111.444.777-35")).toBe(true);
    expect(cpfCnpjValido("111.111.111-11")).toBe(false);
  });

  it("valida como CNPJ quando tem 14 dígitos", () => {
    expect(cpfCnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cpfCnpjValido("11.111.111/1111-11")).toBe(false);
  });

  it("rejeita qualquer outra quantidade de dígitos", () => {
    expect(cpfCnpjValido("123")).toBe(false);
    expect(cpfCnpjValido("123456789012")).toBe(false);
  });
});
