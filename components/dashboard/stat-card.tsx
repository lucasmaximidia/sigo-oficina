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
  tone?: "default" | "danger" | "success" | "highlight";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-4 shadow-sm md:p-5",
        tone === "danger" && "bg-gradient-to-br from-destructive/15 to-destructive/5",
        tone === "success" && "bg-gradient-to-br from-success/15 to-success/5",
        tone === "default" && "bg-gradient-to-br from-accent to-accent/40",
        tone === "highlight" && "border-2 border-primary/50 bg-gradient-to-br from-primary/20 to-primary/5"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 size-28 rounded-full blur-2xl",
          tone === "danger" && "bg-destructive/20",
          tone === "success" && "bg-success/20",
          tone === "default" && "bg-primary/15",
          tone === "highlight" && "bg-primary/25"
        )}
      />
      <div className="relative flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-card/80 shadow-sm",
            tone === "danger" && "text-destructive",
            tone === "success" && "text-success",
            tone === "default" && "text-primary",
            tone === "highlight" && "text-primary"
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <p
          className={cn(
            "text-sm font-medium",
            tone === "danger" && "text-destructive",
            tone === "success" && "text-success",
            tone === "default" && "text-foreground/70",
            tone === "highlight" && "text-primary"
          )}
        >
          {label}
        </p>
      </div>
      <p
        className={cn(
          "relative mt-3 font-display text-3xl font-bold",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-success",
          tone === "default" && "text-foreground",
          tone === "highlight" && "text-primary"
        )}
      >
        {value}
      </p>
      {hint && <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
