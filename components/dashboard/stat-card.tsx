import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm md:p-5",
        tone === "danger" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <p className={cn("text-sm font-medium", tone === "danger" ? "text-destructive" : "text-muted-foreground")}>
          {label}
        </p>
      </div>
      <p className={cn("mt-3 text-3xl font-bold", tone === "danger" ? "text-destructive" : "text-foreground")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
