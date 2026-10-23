"use client";

import { useRef, useState } from "react";
import { aceitarContratoPublica } from "@/lib/locacao-contrato-publica";

// Pede a localização ao navegador, mas nunca trava: se demorar mais que o
// timeout, se o cliente negar a permissão ou se o dispositivo não suportar,
// resolve com null e o aceite segue sem coordenadas.
function obterLocalizacao(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    let resolvido = false;
    const concluir = (valor: { lat: number; lng: number } | null) => {
      if (resolvido) return;
      resolvido = true;
      resolve(valor);
    };
    const timeout = setTimeout(() => concluir(null), 6000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        concluir({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        concluir(null);
      },
      { timeout: 5500, maximumAge: 0 }
    );
  });
}

export function ContratoAceiteForm({ aluguelId }: { aluguelId: string }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ciente, setCiente] = useState(false);
  const [cienteOrientacoes, setCienteOrientacoes] = useState(false);
  const [cienteRastreamento, setCienteRastreamento] = useState(false);
  const [localizacaoAutorizada, setLocalizacaoAutorizada] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  // Calculado uma vez só — não muda durante o preenchimento do formulário.
  const [fusoHorario] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Nome e sobrenome (duas palavras) + telefone com DDD (pelo menos 10
  // dígitos) — validação simples, só pra habilitar o botão; a validação de
  // verdade acontece no servidor.
  const nomeValido = nome.trim().split(/\s+/).filter(Boolean).length >= 2;
  const telefoneValido = telefone.replace(/\D/g, "").length >= 10;
  const valido =
    ciente && cienteOrientacoes && cienteRastreamento && nomeValido && telefoneValido && localizacaoAutorizada;

  async function handleEnviar(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!valido || enviando) return;
    setEnviando(true);
    // Tenta obter a localização agora, no clique — é quando o navegador
    // mostra o próprio popup de permissão. Escreve direto no input (sem
    // passar por estado do React) pra garantir que o valor já esteja no
    // DOM antes do requestSubmit, sem esperar um novo render.
    const coords = await obterLocalizacao();
    if (coords) {
      if (latitudeRef.current) latitudeRef.current.value = String(coords.lat);
      if (longitudeRef.current) longitudeRef.current.value = String(coords.lng);
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={aceitarContratoPublica.bind(null, aluguelId)}>
      <input type="hidden" name="fusoHorario" value={fusoHorario} readOnly />
      <input type="hidden" name="latitude" ref={latitudeRef} defaultValue="" />
      <input type="hidden" name="longitude" ref={longitudeRef} defaultValue="" />

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

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginTop: 10 }}>
        <input
          type="checkbox"
          required
          checked={cienteOrientacoes}
          onChange={(e) => setCienteOrientacoes(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "#1a7a3c", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#3a4246", lineHeight: 1.4 }}>
          Recebi orientações sobre a utilização e o carregamento correto do equipamento e estou ciente das regras de
          uso.
        </span>
      </label>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginTop: 10 }}>
        <input
          type="checkbox"
          required
          checked={cienteRastreamento}
          onChange={(e) => setCienteRastreamento(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "#1a7a3c", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#3a4246", lineHeight: 1.4 }}>
          Estou ciente de que o equipamento poderá possuir rastreamento por GPS e/ou sensor NFC para fins de
          segurança patrimonial.
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

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginTop: 14 }}>
        <input
          type="checkbox"
          required
          checked={localizacaoAutorizada}
          onChange={(e) => setLocalizacaoAutorizada(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "#1a7a3c", flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: "#3a4246", lineHeight: 1.4 }}>
          Autorizo o compartilhamento da minha localização para confirmar a assinatura. Se o navegador não permitir,
          o aceite segue normalmente.
        </span>
      </label>

      <button
        type="submit"
        disabled={!valido || enviando}
        onClick={handleEnviar}
        style={{
          marginTop: 16,
          width: "100%",
          background: valido && !enviando ? "#1a7a3c" : "#c7ccce",
          color: "#ffffff",
          border: "none",
          borderRadius: 12,
          padding: "13px 0",
          fontSize: 14,
          fontWeight: 700,
          cursor: valido && !enviando ? "pointer" : "not-allowed",
          transition: "background 0.15s",
        }}
      >
        {enviando ? "Enviando..." : "Aceitar contrato"}
      </button>
      {!valido && (
        <p style={{ fontSize: 10.5, color: "#9aa5a9", textAlign: "center", margin: "8px 0 0" }}>
          Marque as declarações acima, preencha nome completo e telefone, e autorize a localização pra habilitar.
        </p>
      )}
    </form>
  );
}
