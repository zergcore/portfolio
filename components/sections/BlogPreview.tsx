import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import BlogCard from "@/components/cards/BlogCard";
import { getBlogPosts } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export default async function BlogPreview() {
  const [blogPosts, t] = await Promise.all([getBlogPosts(), getTranslations("blog")]);
  return (
    <Section id="blog" className="bg-[var(--bg-elevated)]/30 border-y border-[var(--border-subtle)]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            {t("sectionLabel")}{" "}
            <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">{t("sectionHighlight")}</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {t("sectionDescription")}
          </p>
        </div>
      </ScrollReveal>

      {blogPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {blogPosts.map((post, index) => (
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
                {t("viewAll")}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </>
      ) : (
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[var(--text-muted)] text-lg mb-2">{t("noArticlesShort")}</p>
            <p className="text-[var(--text-muted)] text-sm">{t("noArticlesDesc")}</p>
          </div>
        </ScrollReveal>
      )}
    </Section>
  );
}
