import { supabase } from "@/lib/supabase";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { LembreteContasToast } from "@/components/layout/lembrete-contas-toast";
import type { NotificacaoConta, NotificacaoPeca } from "@/components/layout/notificacoes-bell";
import { dataLembreteVencimento } from "@/lib/utils";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const limiteLembreteStr = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2)
    .toISOString()
    .slice(0, 10);

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
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopbar
          logoUrl={config?.logo_url ?? null}
          notificacoesContas={notificacoesContas}
          notificacoesPecas={notificacoesPecas}
        />
        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-28 md:px-6 md:py-6 lg:px-8 lg:pb-6">
          <div className="mx-auto h-full w-full max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
