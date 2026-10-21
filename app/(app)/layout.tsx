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

  // Reforço dos avisos push diários: o Cron do Vercel (plano gratuito) não
  // dispara sempre, então quem abre o app em qualquer página também conta
  // como gatilho — cada aviso só roda 1x por dia (ver
  // lib/notificacoes-diarias.ts), então abrir várias páginas não duplica. Na
  // grande maioria das vezes é só 1 consulta rápida (nenhum aviso está no
  // horário ainda); aguarda aqui (em vez de "disparar e esquecer") porque uma
  // função serverless pode ser encerrada assim que a resposta é enviada, sem
  // garantir que um trabalho em segundo plano termine. Nunca derruba a
  // navegação: um erro aqui só fica registrado no console do servidor.
  try {
    await processarNotificacoesDiarias();
  } catch (error) {
    console.error("Erro ao processar notificações diárias:", error);
  }

  // Mesmo reforço acima, pra quem está atrasado na devolução de um aluguel:
  // o Cron sozinho não é confiável, então abrir o app também dispara o
  // lançamento da diária extra (ver lib/locacao-atraso.ts).
  try {
    await processarExtensaoAlugueisAtrasados();
  } catch (error) {
    console.error("Erro ao processar extensão de aluguéis atrasados:", error);
  }

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
