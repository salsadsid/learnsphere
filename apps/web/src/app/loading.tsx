import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border p-6">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="mt-4 h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
