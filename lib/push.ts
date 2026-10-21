import webPush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY não configuradas em .env.local");
} else {
  webPush.setVapidDetails("mailto:contato@sigooficina.com.br", vapidPublicKey, vapidPrivateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface ResultadoEnvioPush {
  enviados: number;
  falhas: number;
  semChaves: boolean;
  semDispositivos: boolean;
}

// Envia a notificação para todos os dispositivos cadastrados (os 2 usuários
// da oficina têm o mesmo nível de acesso, então não há segmentação por
// usuário). Assinaturas que o navegador recusar de forma permanente (410
// Gone — usuário desinstalou o PWA ou revogou a permissão) são removidas do
// banco para não tentar de novo no próximo disparo.
//
// Devolve quantos envios deram certo/errado em vez de só resolver — antes
// disso, uma falha em TODOS os envios (chave VAPID errada, por exemplo)
// passava batido: a função sempre "dava certo" aos olhos de quem chamou,
// mesmo que nenhuma notificação tivesse realmente chegado a algum lugar.
export async function enviarPushParaTodos(payload: PushPayload): Promise<ResultadoEnvioPush> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("Notificação push não enviada: VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY não configuradas.");
    return { enviados: 0, falhas: 0, semChaves: true, semDispositivos: false };
  }

  const supabase = createServiceClient();
  const { data: subscriptions } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (!subscriptions || subscriptions.length === 0) {
    return { enviados: 0, falhas: 0, semChaves: false, semDispositivos: true };
  }

  const body = JSON.stringify(payload);
  const idsParaRemover: string[] = [];
  let enviados = 0;
  let falhas = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        );
        enviados++;
      } catch (error) {
        falhas++;
        const statusCode = error instanceof webPush.WebPushError ? error.statusCode : null;
        if (statusCode === 404 || statusCode === 410) {
          idsParaRemover.push(sub.id);
        } else {
          // Qualquer outro erro (ex.: chave VAPID errada, payload inválido)
          // ficava mudo antes — sem isso, uma notificação que nunca chega
          // não deixa nenhum rastro pra investigar.
          console.error(`Erro ao enviar push para ${sub.endpoint}:`, statusCode ?? error);
        }
      }
    })
  );

  if (idsParaRemover.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", idsParaRemover);
  }

  return { enviados, falhas, semChaves: false, semDispositivos: false };
}
