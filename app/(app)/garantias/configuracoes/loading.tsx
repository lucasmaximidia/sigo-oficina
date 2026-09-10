import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-4 w-36" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
