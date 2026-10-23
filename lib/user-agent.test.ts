import { describe, expect, it } from "vitest";
import { identificarDispositivo } from "./user-agent";

describe("identificarDispositivo", () => {
  it("identifica iPhone com Safari", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
    expect(identificarDispositivo(ua)).toBe("iPhone · Safari");
  });

  it("identifica iPhone com Chrome (CriOS)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1";
    expect(identificarDispositivo(ua)).toBe("iPhone · Chrome");
  });

  it("identifica Android com Chrome", () => {
    const ua = "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
    expect(identificarDispositivo(ua)).toBe("Android · Chrome");
  });

  it("identifica Windows com Edge", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0";
    expect(identificarDispositivo(ua)).toBe("Windows · Edge");
  });

  it("identifica Mac com Safari", () => {
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15";
    expect(identificarDispositivo(ua)).toBe("Mac · Safari");
  });

  it("devolve só o dispositivo quando não reconhece o navegador", () => {
    expect(identificarDispositivo("AlgumBotDesconhecido/1.0")).toBe("Dispositivo desconhecido");
  });
});
