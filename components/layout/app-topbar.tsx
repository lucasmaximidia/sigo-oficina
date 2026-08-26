"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";

export function AppTopbar({ logoUrl }: { logoUrl: string | null }) {
  const [open, setOpen] = useState(false);

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
        <ThemeToggle />
        <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
          <Link href="/agenda?novo=1">
            <Plus className="size-4" />
            Novo Agendamento
          </Link>
        </Button>
        <Avatar className="ml-1">
          {logoUrl && <AvatarImage src={logoUrl} alt="Logo da empresa" className="object-cover" />}
          <AvatarFallback>SO</AvatarFallback>
        </Avatar>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Brand />
          </SheetHeader>
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
        </SheetContent>
      </Sheet>
    </header>
  );
}
