"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, SECAO_LABEL } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item, index) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        const secaoAnterior = navItems[index - 1]?.secao;
        const mudaSecao = index > 0 && item.secao !== secaoAnterior;
        const ehLocacao = item.secao === "locacao";
        return (
          <div key={item.href} className={cn(ehLocacao && "locacao-theme")}>
            {mudaSecao && (
              <div
                className={cn("mx-0.5 mb-1 mt-2 border-t border-sidebar-border/60", collapsed ? "pt-2" : "pb-1 pt-2.5")}
              >
                {!collapsed && item.secao && (
                  <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                    {SECAO_LABEL[item.secao] ?? item.secao}
                  </p>
                )}
              </div>
            )}
            <Link
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-11",
                collapsed && "justify-center px-0",
                active
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : ehLocacao
                    ? "text-primary/80 hover:bg-accent hover:text-primary"
                    : "text-sidebar-foreground/80 hover:bg-secondary hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              {!collapsed && item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
