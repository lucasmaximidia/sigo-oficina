"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bike, History, Scooter, Users, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/locacao", label: "Veículos", icon: Bike },
  { href: "/locacao/alugueis", label: "Aluguéis", icon: History },
  { href: "/locacao/clientes", label: "Clientes", icon: Users },
  { href: "/locacao/financeiro", label: "Financeiro", icon: Wallet },
];

function useAtivo(href: string) {
  const pathname = usePathname();
  return href === "/locacao" ? pathname === href : pathname.startsWith(href);
}

function ItemLink({ href, label, icon: Icon, vertical }: (typeof ITEMS)[number] & { vertical: boolean }) {
  const ativo = useAtivo(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
        vertical ? "min-h-11 px-3.5 py-2.5" : "shrink-0 whitespace-nowrap px-3.5 py-2",
        ativo
          ? "bg-sidebar-active text-sidebar-active-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-primary"
      )}
    >
      <Icon className="size-4.5 shrink-0" strokeWidth={2} />
      {label}
    </Link>
  );
}

export function LocacaoSidebar() {
  return (
    <>
      {/* Desktop: coluna lateral própria, à parte da navegação da oficina. */}
      <aside className="hidden w-60 shrink-0 flex-col gap-1 lg:sticky lg:top-0 lg:flex lg:self-start">
        <Link
          href="/dashboard"
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Voltar à oficina
        </Link>
        <div className="mb-4 flex items-center gap-3 px-0.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Scooter className="size-5.5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight text-foreground">Locação</p>
            <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Zap className="size-3 fill-current text-locacao-spark" />
              VoltCity
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <ItemLink key={item.href} {...item} vertical />
          ))}
        </nav>
      </aside>

      {/* Mobile/tablet: abas horizontais roláveis, mesma identidade visual. */}
      <div className="flex flex-col gap-3 lg:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Voltar à oficina
        </Link>
        <nav className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto">
          {ITEMS.map((item) => (
            <ItemLink key={item.href} {...item} vertical={false} />
          ))}
        </nav>
      </div>
    </>
  );
}
