import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatDate } from "@/lib/utils";
import type { GarantiaStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_INFO: Record<GarantiaStatus, { label: string; badge: "success" | "warning" | "destructive"; icon: typeof ShieldCheck }> = {
  ativa: { label: "Garantia válida", badge: "success", icon: ShieldCheck },
  critica: { label: "Garantia acabando", badge: "warning", icon: ShieldAlert },
  expirada: { label: "Garantia expirada", badge: "destructive", icon: ShieldX },
  sem_garantia: { label: "Sem garantia", badge: "destructive", icon: ShieldX },
};

export default async function ConsultarGarantiaPage({
  searchParams,
}: {
  searchParams: Promise<{ telefone?: string }>;
}) {
  const { telefone } = await searchParams;
  const telefoneDigits = telefone?.replace(/\D/g, "") ?? "";
  const jaConsultou = telefoneDigits.length >= 10;

  const supabase = await createClient();
  const { data: garantias } = jaConsultou
    ? await supabase.rpc("consultar_garantias_por_telefone", { p_telefone: telefoneDigits })
    : { data: null };

  return (
    <div className="h-dvh overflow-y-auto overscroll-contain bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-action/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-14 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar para o site
          </Link>

          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Consultar Garantia</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite o telefone usado no cadastro para ver a situação da garantia dos seus reparos.
          </p>

          <form className="mt-6 w-full max-w-xs" action="/garantias/consultar">
            <Label htmlFor="telefone" className="mb-1.5 block text-left">
              Telefone / WhatsApp
            </Label>
            <div className="flex gap-2">
              <PhoneInput id="telefone" name="telefone" defaultValue={telefone} placeholder="(27) 90000-0000" autoFocus />
              <Button type="submit" size="icon" aria-label="Consultar">
                <Search className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {jaConsultou && (
        <div className="mx-auto max-w-lg px-4 py-10">
          {!garantias || garantias.length === 0 ? (
            <Card>
              <CardContent className="pt-4 md:pt-5">
                <EmptyState
                  icon={<ShieldX className="size-5" />}
                  title="Nenhuma garantia encontrada"
                  description="Não localizamos nenhum reparo finalizado com este telefone. Verifique o número ou entre em contato com a oficina."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {garantias.map((g) => {
                const info = STATUS_INFO[g.status_garantia];
                const Icon = info.icon;
                return (
                  <Card key={g.os_id}>
                    <CardContent className="flex items-start gap-3 pt-4 md:pt-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {[g.equipamento_tipo, g.equipamento_marca].filter(Boolean).join(" ") || "Equipamento"}
                          </p>
                          <Badge variant={info.badge}>{info.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">OS #OS-{String(g.numero).padStart(4, "0")}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Finalizado em {formatDate(g.data_finalizacao)}</span>
                          <span>Válido até {formatDate(g.data_expiracao)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
