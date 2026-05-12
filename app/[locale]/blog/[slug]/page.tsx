import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/api";
import { ArrowLeft, Clock, Tag } from "lucide-react";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  const title = post?.title ?? "Blog Post";
  const description = post?.excerpt ?? "A technical article by Zaidibeth Ramos.";
  const image = post?.imageUrl ?? "/zr.jpg";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article" as const,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const [post, t] = await Promise.all([
    getBlogPostBySlug(slug),
    getTranslations("blog"),
  ]);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === "es" ? "es-VE" : "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Section id="blog-post" className="pt-32">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-(--text-muted) hover:text-(--accent-cyan) transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              {t("backToHome")}
            </Link>

            <article>
              <header className="mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-(--text-muted) mb-6 pb-6 border-b border-(--border-subtle)">
                  <time dateTime={post.date}>{formattedDate}</time>
                  <span className="w-1 h-1 rounded-full bg-(--border-strong)" />
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {post.readingTime}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-full bg-(--bg-elevated) text-(--text-secondary) border border-(--border-default)"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="prose prose-invert max-w-none">
                <div className="flex flex-col items-center justify-center py-20 text-center bg-(--bg-elevated) rounded-xl border border-(--border-subtle)">
                  <p className="text-lg text-(--text-secondary) mb-2">
                    Full article coming soon.
                  </p>
                  <p className="text-sm text-(--text-muted)">
                    This article is currently being drafted. Check back shortly for the full content.
                  </p>
                </div>
              </div>
            </article>

            <div className="mt-16 pt-8 border-t border-(--border-subtle)">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-(--accent-cyan) transition-colors"
              >
                <ArrowLeft size={14} />
                {t("viewAll")}
              </Link>
            </div>
          </div>
        </Section>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
