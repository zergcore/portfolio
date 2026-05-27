import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";

import Section from "@/components/ui/Section";
import { buildMetadata, siteConfig } from "@/lib/metadata";
import { JsonLd } from "@/lib/schema";
import { BlogGridSkeleton } from "@/components/pages/Blog/BlogGridSkeleton";
import { BlogList } from "@/components/pages/Blog/BlogList";

export async function generateMetadata() {
  const t = await getTranslations("blog");
  return buildMetadata({
    title: `Blog | ${siteConfig.name}`,
    description: t("pageDescription"),
    path: "blog",
  });
}

export default async function BlogPage() {
  // Only await translations here so the page shell can stream instantly
  const t = await getTranslations("blog");

  return (
    <main className="isolate flex w-full flex-1 flex-col">
      {/* Inform Search Engines this is a directory of articles */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Blog | ${siteConfig.name}`,
          description: t("pageDescription"),
          url: `${siteConfig.domain}/blog`
        }}
      />

      <Section id="blog-listing" className="pb-16 pt-32">
        <div className="mb-16 flex flex-col items-center text-center">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t("backToHome")}
          >
            <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
            {t("backToHome")}
          </Link>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {t("pageHeading")}{" "}
            <span className="select-none bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              {t("pageHeadingHighlight")}
            </span>
          </h1>
          <p className="max-w-2xl text-base text-[var(--text-secondary)] md:text-lg">
            {t("pageDescription")}
          </p>
        </div>

        {/* Suspense boundary defers the database query, unblocking the UI above */}
        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogList />
        </Suspense>
      </Section>
    </main>
  );
}
