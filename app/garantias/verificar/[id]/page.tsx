import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VerificarGarantiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: garantia }, { data: config }] = await Promise.all([
    supabase.from("vw_garantias").select("*").eq("os_id", id).maybeSingle(),
    supabase.from("configuracoes").select("nome_empresa, logo_url").eq("id", 1).maybeSingle(),
  ]);

  const valido = garantia && (garantia.status_garantia === "ativa" || garantia.status_garantia === "critica");

  return (
    <div style={{ background: "#f7f9fb" }}>
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#ffffff",
              borderRadius: 16,
              boxShadow: "0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)",
              padding: 28,
              textAlign: "center",
            }}
          >
            {config?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logo_url} alt="" style={{ height: 40, margin: "0 auto 16px", objectFit: "contain" }} />
            )}
            <p style={{ fontSize: 12, fontWeight: 600, color: "#5b6b70", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
              {config?.nome_empresa ?? "Verificação de Garantia"}
            </p>

            {!garantia ? (
              <>
                <ShieldX size={56} color="#dc2626" style={{ margin: "20px auto" }} />
                <h1 style={{ fontSize: 18, margin: "0 0 8px", color: "#191c1e" }}>Certificado não encontrado</h1>
                <p style={{ fontSize: 13, color: "#5b6b70", margin: 0 }}>
                  Não localizamos nenhuma garantia com este código. Verifique o QR code ou entre em contato com a
                  oficina.
                </p>
              </>
            ) : (
              <>
                {valido ? (
                  <ShieldCheck size={56} color="#059669" style={{ margin: "20px auto" }} />
                ) : (
                  <ShieldAlert size={56} color="#f59e0b" style={{ margin: "20px auto" }} />
                )}
                <h1 style={{ fontSize: 18, margin: "0 0 4px", color: "#191c1e" }}>
                  {valido ? "Garantia válida" : "Garantia expirada"}
                </h1>
                <p style={{ fontSize: 13, color: "#5b6b70", margin: "0 0 20px" }}>
                  OS #OS-{String(garantia.numero).padStart(4, "0")}
                </p>

                <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                  <Campo label="Equipamento" valor={[garantia.equipamento_tipo, garantia.equipamento_marca].filter(Boolean).join(" ") || "—"} />
                  <Campo label="Finalizado em" valor={formatDate(garantia.data_finalizacao)} />
                  <Campo label="Válido até" valor={formatDate(garantia.data_expiracao)} />
                </div>
              </>
            )}
        </div>
        <p style={{ fontSize: 11, color: "#9aa5a9", marginTop: 16 }}>Verificação gerada por SIGO Oficina</p>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eceef0", paddingBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#5b6b70" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#191c1e" }}>{valor}</span>
    </div>
  );
}
