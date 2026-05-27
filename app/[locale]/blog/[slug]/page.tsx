import { notFound } from "next/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";

import Section from "@/components/ui/Section";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/api";
import { buildMetadata, siteConfig } from "@/lib/metadata";
// Assuming you have a JsonLd component and a schema builder like your Home page
import { JsonLd, buildArticleSchema } from "@/lib/schema";

interface BlogPostPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  // Next.js 15+ best practice: generate params for all known static routes
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return buildMetadata({ title: "Post Not Found" });

  return buildMetadata({
    title: post.title,
    description: post.excerpt ?? `A technical article by ${siteConfig.name}.`,
    image: post.imageUrl ?? undefined,
    path: `blog/${slug}`,
    ogType: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // Parallelize data fetching, translations, and formatters to prevent waterfalls
  const [post, t, format] = await Promise.all([
    getBlogPostBySlug(slug),
    getTranslations("blog"),
    getFormatter(),
  ]);

  if (!post) return notFound();

  // Native next-intl date formatting based on the active locale
  const formattedDate = format.dateTime(new Date(post.date), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="isolate flex w-full flex-1 flex-col">

      {/* Crucial for Technical SEO */}
      <JsonLd data={buildArticleSchema(post)} />

      <Section id="blog-post" className="pb-16 pt-32">
        <div className="mx-auto w-full max-w-3xl">

          <Link
            href="/blog"
            className="group mb-8 inline-flex items-center gap-2 rounded-md text-sm font-medium text-(--text-muted) transition-colors hover:text-(--accent-cyan) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t("backToBlog")}
          >
            <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
            {t("backToBlog")}
          </Link>

          <article>
            <header className="mb-12">
              <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-(--border-subtle) pb-6 text-sm text-(--text-muted)">
                <time dateTime={new Date(post.date).toISOString()}>{formattedDate}</time>
                <span className="h-1 w-1 rounded-full bg-(--border-strong)" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  <Clock size={16} aria-hidden="true" />
                  {post.readingTime}
                </span>
              </div>

              <div className="flex flex-wrap gap-2" aria-label={t("tags")}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex select-none items-center gap-1.5 rounded-full border border-(--border-default) bg-(--bg-elevated) px-3 py-1 text-xs font-semibold uppercase tracking-wider text-(--text-secondary)"
                  >
                    <Tag size={12} aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="prose prose-invert max-w-none">
              {/* Localized the 'Coming Soon' state */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-(--border-subtle) bg-(--bg-elevated) py-20 text-center shadow-sm">
                <p className="mb-2 text-lg font-medium text-(--text-secondary)">
                  {t("comingSoonTitle")}
                </p>
                <p className="text-sm text-(--text-muted)">
                  {t("comingSoonDescription")}
                </p>
              </div>
            </div>
          </article>

          <div className="mt-16 border-t border-(--border-subtle) pt-8">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-foreground transition-colors hover:text-(--accent-cyan) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
              {t("viewAll")}
            </Link>
          </div>

        </div>
      </Section>
    </main>
  );
}