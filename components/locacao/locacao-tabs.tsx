"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bike, History, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/locacao", label: "Veículos", icon: Bike },
  { href: "/locacao/alugueis", label: "Aluguéis", icon: History },
  { href: "/locacao/clientes", label: "Clientes", icon: Users },
  { href: "/locacao/financeiro", label: "Financeiro", icon: Wallet },
];

export function LocacaoTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted p-1">
      {TABS.map((tab) => {
        const active = tab.href === "/locacao" ? pathname === tab.href : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
