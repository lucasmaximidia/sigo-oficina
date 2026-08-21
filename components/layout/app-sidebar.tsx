import Link from "next/link";
import { Plus } from "lucide-react";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:py-5">
      <div className="mb-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
      <div className="mt-4 px-3">
        <Link
          href="/ordens-servico/nova"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <Plus className="size-4.5" />
          Novo OS
        </Link>
      </div>
    </aside>
  );
}
