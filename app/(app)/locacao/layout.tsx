import { LocacaoSidebar } from "@/components/locacao/locacao-sidebar";

export default function LocacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locacao-theme flex flex-col gap-5">
      <LocacaoSidebar />
      {children}
    </div>
  );
}
