import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Skeleton className="h-4 w-40" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, j) => (
            <Skeleton key={j} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
