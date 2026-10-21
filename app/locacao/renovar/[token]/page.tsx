import { CheckCircle2, Clock, FileX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { aceitarRenovacaoPublica } from "@/lib/locacao-renovacao-publica";

export const dynamic = "force-dynamic";

function formatarDataHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(
    new Date(iso)
  );
}

function Estado({ icon, cor, titulo, texto }: { icon: React.ReactNode; cor: string; titulo: string; texto: string }) {
  return (
    <div style={{ background: "#f7f9fb", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ color: cor, margin: "0 auto 16px" }}>{icon}</div>
        <h1 style={{ fontSize: 18, margin: "0 0 8px", color: "#191c1e" }}>{titulo}</h1>
        <p style={{ fontSize: 13, color: "#5b6b70", margin: 0, lineHeight: 1.5 }}>{texto}</p>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "#9aa5a9", textTransform: "uppercase", margin: "0 0 2px", letterSpacing: 0.3 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#191c1e", margin: 0 }}>{valor}</p>
    </div>
  );
}

export default async function RenovarAluguelPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient();
  const { token } = await params;

  // Página pública (link mandado pelo WhatsApp, sem login) — mesmo padrão de
  // /locacao/contrato: função com privilégio elevado devolvendo só os campos
  // necessários pra exibir os termos, sem abrir leitura anônima nas tabelas.
  const { data: r } = await supabase.rpc("obter_renovacao_locacao", { p_token: token }).maybeSingle();

  if (!r) {
    return (
      <Estado
        icon={<FileX size={56} />}
        cor="#dc2626"
        titulo="Link não encontrado"
        texto="Não localizamos nenhuma renovação com este link. Entre em contato com a VoltCity."
      />
    );
  }

  if (r.status === "expirada" || r.status === "cancelada") {
    return (
      <Estado
        icon={<Clock size={56} />}
        cor="#b45309"
        titulo="Link expirado"
        texto="Esse link de renovação não está mais válido. Peça à VoltCity pra gerar um novo."
      />
    );
  }

  const numero = `#${String(r.numero).padStart(4, "0")}`;

  if (r.status === "aceita") {
    return (
      <Estado
        icon={<CheckCircle2 size={56} />}
        cor="#1a7a3c"
        titulo="Renovação confirmada!"
        texto={`O aluguel ${numero} agora vence em ${formatarDataHora(r.nova_data_devolucao)}. Bom uso!`}
      />
    );
  }

  const novoTotal = r.valor_atual + r.valor_adicional;

  return (
    <div style={{ background: "#f7f9fb", minHeight: "100dvh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)" }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#1a7a3c", margin: 0, letterSpacing: -0.5 }}>VOLTCITY</p>
          <p style={{ fontSize: 10, color: "#5b6b70", margin: "1px 0 0", letterSpacing: 0.5 }}>ALUGUEL E VENDA DE EQUIPAMENTOS ELÉTRICOS</p>
          <h1 style={{ fontSize: 16, margin: "14px 0 4px", color: "#191c1e" }}>Renovação de aluguel</h1>
          <p style={{ fontSize: 12, color: "#5b6b70", margin: 0 }}>
            Olá, {r.cliente_nome}! Confira os novos termos do aluguel {numero} ({r.veiculo_marca} {r.veiculo_modelo}) antes de confirmar.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
            <Campo label="Devolução atual" valor={formatarDataHora(r.data_atual_devolucao)} />
            <Campo label="Nova devolução" valor={formatarDataHora(r.nova_data_devolucao)} />
            <Campo
              label="Dias adicionais"
              valor={`${r.dias_adicionais} dia${r.dias_adicionais === 1 ? "" : "s"}`}
            />
            <Campo label="Valor adicional" valor={formatCurrency(r.valor_adicional)} />
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e9edf0", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "#5b6b70" }}>Novo valor total do aluguel</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#191c1e" }}>{formatCurrency(novoTotal)}</span>
          </div>

          <form action={aceitarRenovacaoPublica.bind(null, token)} style={{ marginTop: 20 }}>
            <button
              type="submit"
              style={{
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
              Aceitar renovação
            </button>
          </form>
          <p style={{ fontSize: 10.5, color: "#9aa5a9", textAlign: "center", margin: "10px 0 0" }}>
            Ao aceitar, a devolução prevista e o valor do aluguel são atualizados automaticamente.
          </p>
        </div>

        <p style={{ fontSize: 11, color: "#9aa5a9", textAlign: "center", margin: "0 0 8px" }}>
          Renovação gerada por SIGO Oficina · VoltCity — Aluguel e Venda de Equipamentos Elétricos
        </p>
      </div>
    </div>
  );
}
