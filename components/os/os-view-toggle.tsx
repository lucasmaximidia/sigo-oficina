"use client";

import Link from "next/link";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "sigo-os-view";

function salvarPreferencia(view: "lista" | "kanban") {
  document.cookie = `${COOKIE_NAME}=${view}; path=/; max-age=31536000`;
}

export function OsViewToggle({ view }: { view: "lista" | "kanban" }) {
  return (
    <div className="flex shrink-0 rounded-xl bg-muted p-1">
      <Link
        href="/ordens-servico"
        onClick={() => salvarPreferencia("lista")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "lista" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="size-4" />
        Lista
      </Link>
      <Link
        href="/ordens-servico?view=kanban"
        onClick={() => salvarPreferencia("kanban")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          view === "kanban" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-4" />
        Kanban
      </Link>
    </div>
  );
}
