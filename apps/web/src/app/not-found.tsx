import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight font-[var(--font-display)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
