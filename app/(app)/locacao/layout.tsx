import { LocacaoTabs } from "@/components/locacao/locacao-tabs";

export default function LocacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5">
        <LocacaoTabs />
      </div>
      {children}
    </div>
  );
}
