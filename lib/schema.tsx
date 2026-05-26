import type { Thing, WithContext } from "schema-dts";
import { siteConfig } from "@/lib/metadata";

/* ─── Generic JSON-LD renderer ───────────────────────────── */

/**
 * Renders a `<script type="application/ld+json">` tag with proper
 * XSS-safe serialization.
 *
 * **Why `dangerouslySetInnerHTML` is safe here:**
 * - `JSON.stringify` escapes all embedded quotes and backslashes.
 * - The `.replace(/</)` prevents `</script>` breakout attacks.
 * - The input is a typed schema object — never raw user HTML.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
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
}

export function buildPersonSchema(
  profile?: ProfileData | null,
): WithContext<Thing> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name ?? siteConfig.name,
    url: siteConfig.domain,
    jobTitle: profile?.title ?? "Full-Stack Software Engineer",
    description: profile?.bio ?? siteConfig.description,
    email: profile?.email ?? undefined,
    image: profile?.imageUrl ?? `${siteConfig.domain}${siteConfig.ogImage.url}`,
    sameAs: [profile?.githubUrl, profile?.linkedinUrl].filter(Boolean),
    knowsAbout: [
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
    ],
  } as WithContext<Thing>;
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
): WithContext<Thing> {
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
    ...(project.tags?.length && { keywords: project.tags.join(", ") }),
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    ...(project.liveUrl && { sameAs: project.liveUrl }),
  } as WithContext<Thing>;
}
