import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Skeleton className="h-4 w-52" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full max-w-xs rounded-lg" />
      </div>

      <Skeleton className="h-10 w-full max-w-sm rounded-xl" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    </div>
  );
}
