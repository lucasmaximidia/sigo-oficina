import { describe, expect, it } from "vitest";
import { cpfValido } from "./cpf";

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
