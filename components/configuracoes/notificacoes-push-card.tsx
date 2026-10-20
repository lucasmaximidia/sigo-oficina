"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, BellOff, Send, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { descreverDispositivo, formatDateTime } from "@/lib/utils";
import {
  salvarPushSubscription,
  removerPushSubscription,
  removerPushSubscriptionPorId,
  enviarNotificacaoTeste,
  updateConfiguracoesPush,
} from "@/lib/actions";
import type { Configuracao } from "@/types";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Web Push exige a chave pública do servidor nesse formato (Uint8Array), mas
// ela é distribuída como base64url — essa é a conversão padrão entre os dois.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export interface DispositivoPush {
  id: string;
  endpoint: string;
  user_agent: string | null;
  created_at: string;
}

type Suporte = "verificando" | "sem_suporte" | "suportado";

export function NotificacoesPushCard({
  config,
  dispositivos,
}: {
  config: Pick<Configuracao, "push_contas_vencer_ativo" | "push_contas_vencer_dias" | "push_agenda_hoje_ativo">;
  dispositivos: DispositivoPush[];
}) {
  const [suporte, setSuporte] = useState<Suporte>("verificando");
  const [ativo, setAtivo] = useState(false);
  const [endpointAtual, setEndpointAtual] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isPendingConfig, startTransitionConfig] = useTransition();
  const [isPendingTeste, startTransitionTeste] = useTransition();
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  useEffect(() => {
    async function verificar() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) {
        setSuporte("sem_suporte");
        return;
      }
      setSuporte("suportado");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setAtivo(!!subscription && Notification.permission === "granted");
      setEndpointAtual(subscription?.endpoint ?? null);
    }
    verificar();
  }, []);

  function ativar() {
    startTransition(async () => {
      try {
        if (!VAPID_PUBLIC_KEY) throw new Error("Notificações não configuradas no servidor");
        const permissao = await Notification.requestPermission();
        if (permissao !== "granted") {
          toast.error("Permissão de notificações negada no navegador");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          throw new Error("Assinatura de notificação inválida");
        }
        await salvarPushSubscription({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          userAgent: navigator.userAgent,
        });
        setAtivo(true);
        setEndpointAtual(json.endpoint);
        toast.success("Notificações ativadas neste dispositivo");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao ativar notificações");
      }
    });
  }

  function desativar() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await removerPushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setAtivo(false);
        setEndpointAtual(null);
        toast.success("Notificações desativadas neste dispositivo");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao desativar notificações");
      }
    });
  }

  function testar() {
    startTransitionTeste(async () => {
      try {
        await enviarNotificacaoTeste();
        toast.success("Notificação de teste enviada — pode levar alguns segundos para chegar");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao enviar notificação de teste");
      }
    });
  }

  function salvarConfig(formData: FormData) {
    startTransitionConfig(async () => {
      try {
        await updateConfiguracoesPush(formData);
        toast.success("Configuração de avisos salva");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao salvar");
      }
    });
  }

  function removerDispositivo(id: string, endpoint: string) {
    setRemovendoId(id);
    startTransition(async () => {
      try {
        await removerPushSubscriptionPorId(id);
        if (endpoint === endpointAtual) {
          setAtivo(false);
          setEndpointAtual(null);
        }
        toast.success("Dispositivo removido");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao remover dispositivo");
      } finally {
        setRemovendoId(null);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4.5 text-primary" />
          Notificações
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Receba avisos de contas a vencer e agendamentos do dia direto no celular ou computador, mesmo com o app
          fechado.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {suporte === "sem_suporte" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="size-4 shrink-0" />
            Esse navegador ou dispositivo não suporta notificações. No iPhone, adicione o app à Tela de Início
            primeiro (compartilhar → Adicionar à Tela de Início).
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground">Avisar contas a vencer neste dispositivo</span>
              <Switch
                checked={ativo}
                disabled={isPending || suporte === "verificando"}
                onCheckedChange={(checked) => (checked ? ativar() : desativar())}
              />
            </label>
            {ativo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={isPendingTeste}
                onClick={testar}
              >
                <Send className="size-3.5" />
                {isPendingTeste ? "Enviando..." : "Enviar notificação de teste"}
              </Button>
            )}
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Aviso de contas a vencer
          </p>
          <form action={salvarConfig} className="flex flex-col gap-3">
            <label className="flex items-center gap-2.5">
              <Checkbox name="push_contas_vencer_ativo" defaultChecked={config.push_contas_vencer_ativo} />
              <span className="text-sm text-foreground">Enviar notificação (independente do sino no topo do app)</span>
            </label>
            <div className="max-w-xs">
              <Label htmlFor="push_contas_vencer_dias" className="mb-1.5 block">
                Avisar com quantos dias de antecedência
              </Label>
              <NumericInput
                id="push_contas_vencer_dias"
                name="push_contas_vencer_dias"
                decimal={false}
                defaultValue={config.push_contas_vencer_dias}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Contas já vencidas ou vencendo hoje sempre avisam, independente desse número.
              </p>
            </div>

            <label className="mt-2 flex items-center gap-2.5 border-t border-border pt-4">
              <Checkbox name="push_agenda_hoje_ativo" defaultChecked={config.push_agenda_hoje_ativo} />
              <span className="text-sm text-foreground">Avisar agendamentos do dia (manhã, com o resumo do dia)</span>
            </label>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isPendingConfig}>
                {isPendingConfig ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>

        {dispositivos.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dispositivos cadastrados
            </p>
            <div className="flex flex-col gap-2">
              {dispositivos.map((dispositivo) => (
                <div
                  key={dispositivo.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {descreverDispositivo(dispositivo.user_agent)}
                      {dispositivo.endpoint === endpointAtual && (
                        <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Este dispositivo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Ativado em {formatDateTime(dispositivo.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerDispositivo(dispositivo.id, dispositivo.endpoint)}
                    disabled={removendoId === dispositivo.id}
                    className="-m-2 shrink-0 p-2 text-muted-foreground hover:text-destructive"
                    aria-label="Remover dispositivo"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
