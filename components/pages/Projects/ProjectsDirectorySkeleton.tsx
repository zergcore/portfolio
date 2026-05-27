import { Loader2 } from "lucide-react";

export function ProjectsDirectorySkeleton() {
    return (
        <div className="flex w-full flex-col items-center gap-8 py-12">
            <Loader2 size={32} className="animate-spin text-[var(--accent-cyan)] opacity-50" aria-hidden="true" />
            <span className="sr-only">Loading projects...</span>

            {/* Filter Chips Skeleton */}
            <div className="flex flex-wrap justify-center gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-[var(--bg-elevated)]" />
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-72 w-full animate-pulse rounded-2xl bg-[var(--bg-elevated)]" />
                ))}
            </div>
        </div>
    );
}