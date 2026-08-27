import { supabase } from "@/lib/supabase";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageTransition } from "@/components/layout/page-transition";
import type { NotificacaoConta, NotificacaoPeca } from "@/components/layout/notificacoes-bell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const hojeStr = new Date().toISOString().slice(0, 10);

  const [{ data: config }, { data: contasVencendo }, { data: pecas }] = await Promise.all([
    supabase.from("configuracoes").select("logo_url").eq("id", 1).single(),
    supabase
      .from("financeiro_contas")
      .select("id, descricao, vencimento, valor")
      .neq("status", "pago")
      .lte("vencimento", hojeStr)
      .order("vencimento", { ascending: true }),
    supabase.from("pecas").select("id, nome, quantidade, quantidade_minima"),
  ]);

  const notificacoesContas: NotificacaoConta[] = contasVencendo ?? [];
  const notificacoesPecas: NotificacaoPeca[] = (pecas ?? [])
    .filter((peca) => peca.quantidade <= peca.quantidade_minima)
    .map((peca) => ({ id: peca.id, nome: peca.nome, quantidade: peca.quantidade }));

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          logoUrl={config?.logo_url ?? null}
          notificacoesContas={notificacoesContas}
          notificacoesPecas={notificacoesPecas}
        />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
