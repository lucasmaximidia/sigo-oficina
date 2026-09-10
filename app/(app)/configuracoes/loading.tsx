import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}
