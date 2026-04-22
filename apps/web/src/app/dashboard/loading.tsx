import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border p-5">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-2 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
