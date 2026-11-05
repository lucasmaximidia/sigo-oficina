import { Wrench } from "lucide-react";

export function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-action text-action-foreground">
        <Wrench className="size-5" strokeWidth={2.25} />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold text-sidebar-foreground">SIGO Oficina</p>
          <p className="text-xs text-sidebar-foreground/60">Administrador</p>
        </div>
      )}
    </div>
  );
}
