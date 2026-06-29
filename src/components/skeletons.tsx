import { Skeleton } from "@/components/ui/skeleton";

export function CardGridSkeleton({ count = 4, cols = 2 }: { count?: number; cols?: 1 | 2 | 3 }) {
  const gridCls = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2";
  return (
    <div className={`grid gap-3 ${gridCls}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-secondary/30 px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-3 ${count === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="mt-3 h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
