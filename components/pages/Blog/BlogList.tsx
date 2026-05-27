import BlogCard from "@/components/cards/BlogCard";
import { getBlogPosts } from "@/lib/api";
import { ArrowLeft, PenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/dist/client/link";

export async function BlogList() {
    const [posts, t] = await Promise.all([
        getBlogPosts(),
        getTranslations("blog")
    ]);

    if (posts.length === 0) {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-24 text-center shadow-sm">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--background)]">
                    <PenLine size={32} className="text-[var(--text-muted)]" aria-hidden="true" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-foreground">
                    {t("emptyTitle")}
                </h2>
                <p className="mb-8 text-[var(--text-secondary)]">
                    {t("emptyDesc")}
                </p>
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
                    {t("backToHome")}
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
            ))}
        </div>
    );
}