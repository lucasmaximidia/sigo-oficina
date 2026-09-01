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
        "rounded-xl p-4 shadow-sm md:p-5",
        tone === "danger" && "bg-destructive/10",
        tone === "success" && "bg-success/10",
        tone === "default" && "bg-accent",
        tone === "highlight" && "border-2 border-primary/50 bg-primary/10"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg bg-card/70",
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
          "mt-3 font-display text-3xl font-bold",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-success",
          tone === "default" && "text-foreground",
          tone === "highlight" && "text-primary"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
