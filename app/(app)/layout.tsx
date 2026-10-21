import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AppShellSidebar } from "@/components/layout/app-shell-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { LembreteContasToast } from "@/components/layout/lembrete-contas-toast";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import type { NotificacaoConta, NotificacaoPeca } from "@/components/layout/notificacoes-bell";
import { dataLembreteVencimento, diasAPartirDe, hojeBR } from "@/lib/utils";
import { processarNotificacoesDiarias } from "@/lib/notificacoes-diarias";
import { processarExtensaoAlugueisAtrasados } from "@/lib/locacao-atraso";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const hojeStr = hojeBR();
  const limiteLembreteStr = diasAPartirDe(hojeStr, 2);

  // Reforço dos avisos push diários + da extensão de aluguéis atrasados: o
  // Cron do Vercel (plano gratuito) não dispara sempre, então quem abre o
  // app em qualquer página também conta como gatilho (cada verificação é
  // idempotente, então abrir várias páginas não duplica nada). Roda com
  // after() — depois da resposta já ter sido enviada — em vez de aguardar
  // aqui: antes disso travava TODA navegação no app esperando essas duas
  // consultas, mesmo em páginas sem nada a ver com cobrança ou locação. O
  // after() do Next.js resolve exatamente o motivo de antes ter sido feito
  // de forma bloqueante (a função serverless podia ser encerrada assim que a
  // resposta fosse enviada) sem pagar o preço de travar a página. Nunca
  // derruba a navegação: um erro aqui só fica registrado no console do
  // servidor.
  after(async () => {
    try {
      await processarNotificacoesDiarias();
    } catch (error) {
      console.error("Erro ao processar notificações diárias:", error);
    }
    try {
      await processarExtensaoAlugueisAtrasados();
    } catch (error) {
      console.error("Erro ao processar extensão de aluguéis atrasados:", error);
    }
  });

  const [{ data: config }, { data: contasVencendo }, { data: contasParaLembrete }, { data: pecas }] =
    await Promise.all([
      supabase.from("configuracoes").select("logo_url").eq("id", 1).single(),
      supabase
        .from("financeiro_contas")
        .select("id, descricao, vencimento, valor")
        .neq("status", "pago")
        .lte("vencimento", hojeStr)
        .order("vencimento", { ascending: true }),
      supabase
        .from("financeiro_contas")
        .select("id, descricao, vencimento, valor")
        .neq("status", "pago")
        .gte("vencimento", hojeStr)
        .lte("vencimento", limiteLembreteStr),
      supabase.from("pecas").select("id, nome, quantidade, quantidade_minima"),
    ]);

  const notificacoesContas: NotificacaoConta[] = contasVencendo ?? [];
  const contasLembreteHoje = (contasParaLembrete ?? []).filter(
    (conta) => dataLembreteVencimento(conta.vencimento) === hojeStr
  );
  const notificacoesPecas: NotificacaoPeca[] = (pecas ?? [])
    .filter((peca) => peca.quantidade <= peca.quantidade_minima)
    .map((peca) => ({ id: peca.id, nome: peca.nome, quantidade: peca.quantidade }));

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <LembreteContasToast contas={contasLembreteHoje} />
      <ServiceWorkerRegister />
      <AppShellSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          logoUrl={config?.logo_url ?? null}
          notificacoesContas={notificacoesContas}
          notificacoesPecas={notificacoesPecas}
        />
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] md:px-6 md:py-6 lg:px-8 lg:pb-6">
          <div className="mx-auto h-full w-full max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
