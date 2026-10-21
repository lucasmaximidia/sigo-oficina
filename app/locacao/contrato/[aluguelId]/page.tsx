import { FileX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { CLAUSULAS_CONTRATO } from "@/lib/locacao-contrato-texto";
import { aceitarContratoPublica } from "@/lib/locacao-contrato-publica";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  scooter: "Scooter Elétrica",
  bicicleta: "Bicicleta Elétrica",
};

const FORMA_LABEL: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export default async function ContratoLocacaoPublicoPage({ params }: { params: Promise<{ aluguelId: string }> }) {
  const supabase = await createClient();
  const { aluguelId } = await params;

  // Página pública (acessada via QR code no contrato em PDF, sem login) —
  // mesmo padrão de /garantias/verificar: funções com privilégio elevado
  // (security definer) devolvendo só os campos necessários, em vez de abrir
  // policy de leitura anônima nas tabelas em si. Os campos de aceite ficam
  // numa função separada (obter_contrato_aceite) pra não precisar alterar o
  // retorno de verificar_contrato_locacao, já em produção.
  const [{ data: contrato }, { data: aceite }] = await Promise.all([
    supabase.rpc("verificar_contrato_locacao", { p_aluguel_id: aluguelId }).maybeSingle(),
    supabase.rpc("obter_contrato_aceite", { p_aluguel_id: aluguelId }).maybeSingle(),
  ]);

  const formatarDataHora = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(
      new Date(iso)
    );

  if (!contrato) {
    return (
      <div style={{ background: "#f7f9fb", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <FileX size={56} color="#dc2626" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 18, margin: "0 0 8px", color: "#191c1e" }}>Contrato não encontrado</h1>
          <p style={{ fontSize: 13, color: "#5b6b70", margin: 0 }}>
            Não localizamos nenhum contrato com este código. Verifique o QR code ou entre em contato com a VoltCity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f9fb", minHeight: "100dvh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#1a7a3c", margin: 0, letterSpacing: -0.5 }}>VOLTCITY</p>
          <p style={{ fontSize: 10, color: "#5b6b70", margin: "1px 0 0", letterSpacing: 0.5 }}>ALUGUEL E VENDA DE EQUIPAMENTOS ELÉTRICOS</p>
          <h1 style={{ fontSize: 16, margin: "14px 0 2px", color: "#191c1e" }}>Contrato de Locação de Equipamento Elétrico</h1>
          <p style={{ fontSize: 12, color: "#5b6b70", margin: 0 }}>Aluguel #{String(contrato.numero).padStart(4, "0")}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
            <Campo label="Locatário" valor={contrato.cliente_nome} />
            <Campo label="Equipamento" valor={`${contrato.veiculo_marca} ${contrato.veiculo_modelo}`} />
            <Campo label="Tipo / Cor" valor={`${TIPO_LABEL[contrato.veiculo_tipo] ?? contrato.veiculo_tipo}${contrato.veiculo_cor ? ` · ${contrato.veiculo_cor}` : ""}`} />
            <Campo label="Chassi" valor={contrato.veiculo_chassi} />
            <Campo label="Retirada" valor={formatarDataHora(contrato.data_retirada)} />
            <Campo label="Devolução prevista" valor={formatarDataHora(contrato.data_prevista_devolucao)} />
            <Campo label="Valor" valor={formatCurrency(contrato.valor)} />
            <Campo label="Forma de pagamento" valor={FORMA_LABEL[contrato.forma_pagamento] ?? contrato.forma_pagamento} />
          </div>

          <p style={{ fontSize: 11, color: "#5b6b70", margin: "18px 0 0", lineHeight: 1.5 }}>
            Pelo presente instrumento particular de locação de bem móvel (&ldquo;Contrato&rdquo;), de um lado{" "}
            {contrato.locadora_razao_social}, pessoa jurídica de direito privado, inscrita no CNPJ nº {contrato.locadora_cnpj},
            com sede em {contrato.locadora_endereco}, doravante LOCADORA; e de outro lado o LOCATÁRIO acima qualificado;
            têm entre si justo e contratado o presente instrumento, regido pelas cláusulas seguintes.
          </p>
        </div>

        <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
          {CLAUSULAS_CONTRATO.map((c) => (
            <div key={c.titulo}>
              <h2 style={{ fontSize: 12.5, fontWeight: 700, color: "#191c1e", margin: "0 0 4px" }}>{c.titulo}</h2>
              <p style={{ fontSize: 12.5, color: "#3a4246", margin: 0, lineHeight: 1.5, textAlign: "justify" }}>{c.texto}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)" }}>
          {!aceite?.aceite_online_em ? (
            <form action={aceitarContratoPublica.bind(null, aluguelId)}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#191c1e", margin: "0 0 10px" }}>Aceite do contrato</h2>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="ciente"
                  required
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "#1a7a3c", flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: "#3a4246", lineHeight: 1.4 }}>
                  Li e concordo integralmente com o Contrato de Locação acima.
                </span>
              </label>

              <label style={{ display: "block", marginTop: 14 }}>
                <span style={{ fontSize: 10, color: "#9aa5a9", textTransform: "uppercase", letterSpacing: 0.3 }}>
                  Confirme digitando seu nome completo
                </span>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={contrato.cliente_nome}
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
                style={{
                  marginTop: 16,
                  width: "100%",
                  background: "#1a7a3c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Aceitar contrato
              </button>
            </form>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#1a7a3c", fontWeight: 700, margin: 0 }}>
                ✓ Contrato aceito por {aceite.aceite_online_nome} em {formatarDataHora(aceite.aceite_online_em)}
              </p>
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: aceite.status_pagamento === "pago" ? "#effaf1" : "#fff7ed",
                  color: aceite.status_pagamento === "pago" ? "#1a7a3c" : "#b45309",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {aceite.status_pagamento === "pago"
                  ? "✓ Pagamento confirmado"
                  : aceite.status_pagamento === "parcial"
                    ? `Pagamento parcial — ${formatCurrency(aceite.valor_pago)} de ${formatCurrency(aceite.valor)} pago. Aguardando o restante.`
                    : "Aguardando pagamento."}
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: 11, color: "#9aa5a9", textAlign: "center", margin: "0 0 8px" }}>
          Contrato gerado por SIGO Oficina · VoltCity — Aluguel e Venda de Equipamentos Elétricos
        </p>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "#9aa5a9", textTransform: "uppercase", margin: "0 0 2px", letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#191c1e", margin: 0 }}>{valor}</p>
    </div>
  );
}
