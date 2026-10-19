"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { salvarPushSubscription, removerPushSubscription } from "@/lib/actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Web Push exige a chave pública do servidor nesse formato (Uint8Array), mas
// ela é distribuída como base64url — essa é a conversão padrão entre os dois.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Suporte = "verificando" | "sem_suporte" | "suportado";

export function NotificacoesPushCard() {
  const [suporte, setSuporte] = useState<Suporte>("verificando");
  const [ativo, setAtivo] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        });
        setAtivo(true);
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
        toast.success("Notificações desativadas neste dispositivo");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao desativar notificações");
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
          Receba avisos de contas a vencer direto no celular ou computador, mesmo com o app fechado.
        </p>
      </CardHeader>
      <CardContent>
        {suporte === "sem_suporte" ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="size-4 shrink-0" />
            Esse navegador ou dispositivo não suporta notificações. No iPhone, adicione o app à Tela de Início
            primeiro (compartilhar → Adicionar à Tela de Início).
          </p>
        ) : (
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">Avisar contas a vencer neste dispositivo</span>
            <Switch
              checked={ativo}
              disabled={isPending || suporte === "verificando"}
              onCheckedChange={(checked) => (checked ? ativar() : desativar())}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}
