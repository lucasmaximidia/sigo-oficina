import { LocacaoSidebar } from "@/components/locacao/locacao-sidebar";

export default function LocacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locacao-theme flex flex-col gap-6 lg:flex-row lg:gap-8">
      <LocacaoSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
