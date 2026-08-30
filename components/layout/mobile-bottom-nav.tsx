"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Wrench, CalendarDays, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Início", icon: LayoutGrid },
  { href: "/ordens-servico", label: "OS", icon: Wrench },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

function TabLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-semibold",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5.5" strokeWidth={active ? 2.3 : 2} />
      {label}
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed inset-x-5 bottom-5 z-40 h-[76px] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navegação principal"
    >
      <div className="absolute bottom-0 left-0 flex h-16 w-[45%] items-center rounded-full bg-card shadow-[0_10px_26px_-10px_rgba(20,22,42,0.28)]">
        <TabLink {...tabs[0]} active={isActive(tabs[0].href)} />
        <TabLink {...tabs[1]} active={isActive(tabs[1].href)} />
      </div>

      <div className="absolute bottom-0 right-0 flex h-16 w-[45%] items-center rounded-full bg-card shadow-[0_10px_26px_-10px_rgba(20,22,42,0.28)]">
        <TabLink {...tabs[2]} active={isActive(tabs[2].href)} />
        <TabLink {...tabs[3]} active={isActive(tabs[3].href)} />
      </div>

      <Link
        href="/ordens-servico/nova"
        aria-label="Nova OS"
        className="absolute bottom-[18px] left-1/2 flex size-[62px] -translate-x-1/2 items-center justify-center rounded-full bg-foreground text-background shadow-[0_10px_22px_-6px_rgba(20,22,42,0.5)]"
      >
        <Plus className="size-6.5" strokeWidth={2.5} />
      </Link>
    </nav>
  );
}
