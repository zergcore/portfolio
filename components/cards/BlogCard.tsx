import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import type { BlogPost } from "@/lib/mockData";

export default function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <article className="group flex flex-col h-full rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/50 transition-all duration-300 hover:shadow-glow-cyan overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 w-full bg-[image:var(--gradient-brand)] opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col flex-1 p-6">
        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
          <time dateTime={post.date}>{formattedDate}</time>
          <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.readingTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-cyan)] transition-colors line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="focus:outline-none">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-5 flex-1">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)]"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
