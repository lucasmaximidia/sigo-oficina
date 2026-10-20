"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LOCACAO_NAV_ITEMS, locacaoItemAtivo } from "./locacao-nav";
import { cn } from "@/lib/utils";

// No desktop a navegação do módulo já é a própria sidebar do app (ver
// LocacaoAppSidebar) — aqui fica só a versão mobile, abas horizontais
// roláveis dentro do conteúdo, já que no celular a sidebar principal vira
// o Sheet do topo.
export function LocacaoSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        Voltar à oficina
      </Link>
      <nav className="flex w-full max-w-full items-center gap-1.5 overflow-x-auto">
        {LOCACAO_NAV_ITEMS.map((item) => {
          const ativo = locacaoItemAtivo(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                ativo
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-primary"
              )}
            >
              <Icon className="size-4.5 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
