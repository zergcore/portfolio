import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Section from "@/components/ui/Section";
import { getBlogPosts } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import BlogCard from "@/components/cards/BlogCard";
import { ArrowLeft, PenLine } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("blog");
  return buildMetadata({
    title: "Blog | Zergcore.dev",
    description: t("pageDescription"),
    path: "blog",
  });
}

export default async function BlogPage() {
  const [posts, t] = await Promise.all([getBlogPosts(), getTranslations("blog")]);

  return (
    <>
      <main className="flex-1 flex flex-col">
        <Section id="blog-listing" className="pt-32">
          <div className="flex flex-col items-center text-center mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-(--text-muted) hover:text-(--accent-cyan) transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              {t("backToHome")}
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("pageHeading")}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-(--accent-cyan) to-(--accent-violet)">
                {t("pageHeadingHighlight")}
              </span>
            </h1>
            <p className="text-(--text-secondary) max-w-2xl">{t("pageDescription")}</p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-(--bg-elevated) border border-(--border-subtle) mb-6">
                <PenLine size={32} className="text-(--text-muted)" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {t("emptyTitle")}
              </h2>
              <p className="text-(--text-secondary) max-w-md mb-8">{t("emptyDesc")}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground border border-(--border-strong) rounded-full hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
              >
                <ArrowLeft size={16} />
                {t("backToHome")}
              </Link>
            </div>
          )}
        </Section>
      </main>

    </>
  );
}
