"use client";

import { useState } from "react";
import { aceitarContratoPublica } from "@/lib/locacao-contrato-publica";

export function ContratoAceiteForm({ aluguelId }: { aluguelId: string }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ciente, setCiente] = useState(false);

  // Nome e sobrenome (duas palavras) + telefone com DDD (pelo menos 10
  // dígitos) — validação simples, só pra habilitar o botão; a validação de
  // verdade acontece no servidor.
  const nomeValido = nome.trim().split(/\s+/).filter(Boolean).length >= 2;
  const telefoneValido = telefone.replace(/\D/g, "").length >= 10;
  const valido = ciente && nomeValido && telefoneValido;

  return (
    <form action={aceitarContratoPublica.bind(null, aluguelId)}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#191c1e", margin: "0 0 10px" }}>Aceite do contrato</h2>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
        <input
          type="checkbox"
          name="ciente"
          required
          checked={ciente}
          onChange={(e) => setCiente(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "#1a7a3c", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#3a4246", lineHeight: 1.4 }}>
          Li e concordo integralmente com o Contrato de Locação acima.
        </span>
      </label>

      <label style={{ display: "block", marginTop: 14 }}>
        <span style={{ fontSize: 10, color: "#9aa5a9", textTransform: "uppercase", letterSpacing: 0.3 }}>
          Nome completo
        </span>
        <input
          type="text"
          name="nome"
          required
          placeholder="Seu nome e sobrenome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            border: "1px solid #d7dee1",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            color: "#191c1e",
          }}
        />
      </label>

      <label style={{ display: "block", marginTop: 12 }}>
        <span style={{ fontSize: 10, color: "#9aa5a9", textTransform: "uppercase", letterSpacing: 0.3 }}>
          Telefone
        </span>
        <input
          type="tel"
          name="telefone"
          required
          inputMode="tel"
          placeholder="(27) 99999-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            border: "1px solid #d7dee1",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 14,
            color: "#191c1e",
          }}
        />
      </label>

      <button
        type="submit"
        disabled={!valido}
        style={{
          marginTop: 16,
          width: "100%",
          background: valido ? "#1a7a3c" : "#c7ccce",
          color: "#ffffff",
          border: "none",
          borderRadius: 12,
          padding: "13px 0",
          fontSize: 14,
          fontWeight: 700,
          cursor: valido ? "pointer" : "not-allowed",
          transition: "background 0.15s",
        }}
      >
        Aceitar contrato
      </button>
      {!valido && (
        <p style={{ fontSize: 10.5, color: "#9aa5a9", textAlign: "center", margin: "8px 0 0" }}>
          Preencha nome completo e telefone pra habilitar.
        </p>
      )}
    </form>
  );
}
