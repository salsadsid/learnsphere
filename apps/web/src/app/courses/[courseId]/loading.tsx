import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-4 h-9 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full max-w-lg" />

      <div className="mt-8 flex gap-3">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      <div className="mt-10 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
