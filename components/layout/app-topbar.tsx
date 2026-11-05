"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Menu, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { LOCACAO_NAV_ITEMS, locacaoItemAtivo, emLocacao } from "@/components/locacao/locacao-nav";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { NotificacoesBell, type NotificacaoConta, type NotificacaoPeca } from "./notificacoes-bell";
import { logout } from "@/lib/auth-actions";

export function AppTopbar({
  logoUrl,
  notificacoesContas,
  notificacoesPecas,
}: {
  logoUrl: string | null;
  notificacoesContas: NotificacaoConta[];
  notificacoesPecas: NotificacaoPeca[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const dentroLocacao = emLocacao(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/80 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </Button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <NotificacoesBell contas={notificacoesContas} pecas={notificacoesPecas} />
        <ThemeToggle />
        <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
          <Link href="/agenda?novo=1">
            <Plus className="size-4" />
            Novo Agendamento
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Menu da conta" className="ml-1 cursor-pointer rounded-full">
              <Avatar>
                {logoUrl && <AvatarImage src={logoUrl} alt="Logo da empresa" className="object-cover" />}
                <AvatarFallback>SO</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isPending}
              onSelect={() => startTransition(() => logout())}
            >
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className={cn("w-72 p-0", dentroLocacao && "locacao-theme")}>
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Brand />
          </SheetHeader>
          {dentroLocacao ? (
            <>
              <div className="px-4 pt-1">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar à oficina
                </Link>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                {LOCACAO_NAV_ITEMS.map((item) => {
                  const ativo = locacaoItemAtivo(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
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
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
              <div className="p-4">
                <Link
                  href="/ordens-servico/nova"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-action px-4 text-sm font-semibold text-action-foreground shadow-sm hover:bg-action-hover"
                >
                  <Plus className="size-4.5" />
                  Novo OS
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
