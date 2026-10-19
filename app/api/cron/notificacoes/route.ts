import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { dataLembreteVencimento, formatCurrency } from "@/lib/utils";
import { enviarPushParaTodos } from "@/lib/push";

export const dynamic = "force-dynamic";

// Disparado 1x/dia pelo Vercel Cron (ver vercel.json). Reproduz a mesma
// regra do sino de notificações/toast do app (app/(app)/layout.tsx), mas
// via push — para avisar mesmo com o app fechado. O Vercel assina a
// requisição com `Authorization: Bearer $CRON_SECRET` automaticamente
// quando essa variável está configurada no projeto; sem ela configurada,
// a rota rejeita qualquer chamada (fail closed) em vez de ficar aberta.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const limiteLembreteStr = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2)
    .toISOString()
    .slice(0, 10);

  const [{ data: contasVencendo }, { data: contasParaLembrete }] = await Promise.all([
    supabase
      .from("financeiro_contas")
      .select("id, descricao, vencimento, valor")
      .neq("status", "pago")
      .lte("vencimento", hojeStr),
    supabase
      .from("financeiro_contas")
      .select("id, descricao, vencimento, valor")
      .neq("status", "pago")
      .gte("vencimento", hojeStr)
      .lte("vencimento", limiteLembreteStr),
  ]);

  const vencidas = contasVencendo ?? [];
  const lembreteHoje = (contasParaLembrete ?? []).filter(
    (conta) => dataLembreteVencimento(conta.vencimento) === hojeStr
  );

  if (vencidas.length === 0 && lembreteHoje.length === 0) {
    return NextResponse.json({ enviado: false });
  }

  let title: string;
  let body: string;

  if (vencidas.length > 0) {
    const total = vencidas.reduce((acc, c) => acc + c.valor, 0);
    title =
      vencidas.length === 1 ? "1 conta vencida ou vencendo hoje" : `${vencidas.length} contas vencidas ou vencendo hoje`;
    body = `Total de ${formatCurrency(total)} em aberto.`;
  } else {
    const total = lembreteHoje.reduce((acc, c) => acc + c.valor, 0);
    title = lembreteHoje.length === 1 ? "1 conta vence em breve" : `${lembreteHoje.length} contas vencem em breve`;
    body = `Total de ${formatCurrency(total)} a pagar nos próximos dias.`;
  }

  await enviarPushParaTodos({ title, body, url: "/financeiro" });

  return NextResponse.json({ enviado: true });
}
