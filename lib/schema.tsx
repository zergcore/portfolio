import type { Thing, WithContext, Person, CreativeWork, BlogPosting } from "schema-dts";
import { siteConfig } from "@/lib/metadata";

/* ─── Generic JSON-LD renderer ───────────────────────────── */

/**
 * Renders a `<script type="application/ld+json">` tag with proper
 * XSS-safe serialization.
 */
export function JsonLd<T extends Thing>({
  data,
}: {
  data: WithContext<T>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/* ─── Profile (Person) ───────────────────────────────────── */

interface ProfileData {
  name?: string | null;
  title?: string | null;
  bio?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  skills?: string[] | null;
}

export function buildPersonSchema(
  profile?: ProfileData | null,
): WithContext<Person> {
  const coreExpertise = profile?.skills?.length
    ? profile.skills
    : [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Distributed Systems",
      "AI Integration",
      "Cloud Architecture",
      "LLMs",
      "RAG",
      "ML Engineering",
      "n8n",
      "claude",
      "Gemini",
      "Groq",
    ];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name ?? siteConfig.name,
    url: siteConfig.domain,
    jobTitle: profile?.title ?? "Full-Stack Software Engineer",
    description: profile?.bio ?? siteConfig.description,
    email: profile?.email ?? undefined,
    image: profile?.imageUrl ?? `${siteConfig.domain}${siteConfig.ogImage.url}`,
    sameAs: [profile?.githubUrl, profile?.linkedinUrl].filter(
      (url): url is string => Boolean(url)
    ),
    knowsAbout: coreExpertise
  };
}

/* ─── Project (CreativeWork) ─────────────────────────────── */

interface ProjectData {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  tags?: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
}

export function buildCreativeWorkSchema(
  project: ProjectData,
): WithContext<CreativeWork> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${siteConfig.domain}/projects/${project.slug}`,
    image: project.imageUrl,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.domain,
    },
    // Spread operator conditionally adds properties if they exist
    ...(project.tags?.length && { keywords: project.tags.join(", ") }),
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    ...(project.liveUrl && { sameAs: project.liveUrl }),
  };
}

/* ─── Blog Post (BlogPosting) ────────────────────────────── */

interface BlogPostData {
  title: string;
  excerpt?: string;
  slug: string;
  imageUrl?: string | null;
  date: string | Date;
  tags?: string[];
}

export function buildArticleSchema(
  post: BlogPostData,
): WithContext<BlogPosting> {
  const publishDate = new Date(post.date).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? siteConfig.description,
    url: `${siteConfig.domain}/blog/${post.slug}`,
    // Google Rich Results highly prefers absolute image arrays
    image: post.imageUrl
      ? [post.imageUrl]
      : [`${siteConfig.domain}${siteConfig.ogImage.url}`],
    datePublished: publishDate,
    dateModified: publishDate, // Update this if your CMS tracks actual modified dates
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.domain,
    },
    ...(post.tags?.length && { keywords: post.tags.join(", ") }),
  };
}