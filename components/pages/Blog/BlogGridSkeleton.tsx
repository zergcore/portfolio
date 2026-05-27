export function BlogGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-80 w-full animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                />
            ))}
        </div>
    );
}