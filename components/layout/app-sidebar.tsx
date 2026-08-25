"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Plus, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sigo-sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function setCollapsedPreference(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignora falha ao persistir preferência (modo privado, etc.)
  }
  listeners.forEach((callback) => callback());
}

export function AppSidebar() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <aside
      className={cn(
        "hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:shrink-0 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:py-5 lg:transition-[width] lg:duration-200",
        collapsed ? "lg:w-[76px]" : "lg:w-[260px]"
      )}
    >
      <div className="mb-6 flex items-center justify-between px-1">
        <Brand collapsed={collapsed} />
      </div>
      <div className="px-3">
        <Link
          href="/ordens-servico/nova"
          title="Nova OS"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-action px-4 text-sm font-semibold text-action-foreground shadow-sm transition-colors hover:bg-action-hover"
        >
          <Plus className="size-4.5 shrink-0" />
          {!collapsed && "Nova OS"}
        </Link>
      </div>
      <div className="mt-4 flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className="mt-4 flex flex-col gap-2 px-3">
        <button
          type="button"
          onClick={() => setCollapsedPreference(!collapsed)}
          title={collapsed ? "Expandir menu" : "Encolher menu"}
          className="flex min-h-9 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-secondary hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronsRight className="size-4.5" /> : <ChevronsLeft className="size-4.5" />}
          {!collapsed && "Encolher"}
        </button>
      </div>
    </aside>
  );
}
