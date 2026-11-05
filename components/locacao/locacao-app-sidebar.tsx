"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Scooter, Zap } from "lucide-react";
import { LOCACAO_NAV_ITEMS, locacaoItemAtivo } from "./locacao-nav";
import { cn } from "@/lib/utils";

// Substitui o AppSidebar inteiro (mesmo lugar na tela, mesmas classes de
// largura/altura) enquanto o usuário está em /locacao — nunca os dois ao
// mesmo tempo, pra não parecer "2 menus" empilhados.
export function LocacaoAppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="locacao-theme hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:py-5">
      <div className="px-3">
        <Link
          href="/dashboard"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar à oficina
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3 px-4">
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

      <nav className="mt-5 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {LOCACAO_NAV_ITEMS.map((item) => {
          const ativo = locacaoItemAtivo(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                ativo
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground/80 hover:bg-secondary hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
