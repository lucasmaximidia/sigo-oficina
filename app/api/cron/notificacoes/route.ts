import { NextResponse } from "next/server";
import { processarNotificacoesDiarias } from "@/lib/notificacoes-diarias";
import { processarExtensaoAlugueisAtrasados } from "@/lib/locacao-atraso";

export const dynamic = "force-dynamic";

// Disparado 1x/dia pelo Vercel Cron (ver vercel.json) — mas esse disparo não
// é o único gatilho nem precisa ser confiável sozinho: abrir qualquer
// página do app (app/(app)/layout.tsx) chama a mesma função e serve de
// reforço, já que o Cron do plano gratuito da Vercel não dispara sempre.
// Cada tipo de aviso só roda uma vez por dia (ver lib/notificacoes-diarias),
// então não há risco de notificar duas vezes.
// O Vercel assina a requisição com `Authorization: Bearer $CRON_SECRET`
// automaticamente quando essa variável está configurada no projeto; sem ela
// configurada, a rota rejeita qualquer chamada (fail closed) em vez de
// ficar aberta.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await Promise.all([processarNotificacoesDiarias(), processarExtensaoAlugueisAtrasados()]);

  return NextResponse.json({ enviado: true });
}
