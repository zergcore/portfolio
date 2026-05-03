import Link from "next/link";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BlogCard from "@/components/cards/BlogCard";
import { mockBlogPosts } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";

export default function BlogPreview() {
  return (
    <Section id="blog" className="bg-[var(--bg-elevated)]/30 border-y border-[var(--border-subtle)]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Latest <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">Articles</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Technical writing on architecture decisions, performance optimization, and engineering career growth.
          </p>
        </div>
      </ScrollReveal>

      {mockBlogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {mockBlogPosts.map((post, index) => (
              <ScrollReveal key={post.id} delay={0.1 * (index + 1)}>
                <BlogCard post={post} />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.5}>
            <div className="flex justify-center mt-12">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] border border-[var(--border-strong)] rounded-full hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
              >
                View All Articles
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </>
      ) : (
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[var(--text-muted)] text-lg mb-2">No articles yet</p>
            <p className="text-[var(--text-muted)] text-sm">Check back soon for technical deep-dives and career insights.</p>
          </div>
        </ScrollReveal>
      )}
    </Section>
  );
}
