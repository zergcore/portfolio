import type { MetadataRoute } from "next";

const BASE_URL = "https://zergcore.dev";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/projects`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.5,
  },
];

async function fetchProjectEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((p: { slug?: string }) => p.slug)
      .map((p: { slug: string }) => ({
        url: `${BASE_URL}/projects/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

async function fetchBlogEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(posts)) return [];
    return posts
      .filter(
        (p: { slug?: string; is_published?: boolean }) =>
          p.slug && p.is_published !== false
      )
      .map((p: { slug: string; updated_at?: string }) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectEntries, blogEntries] = await Promise.all([
    fetchProjectEntries(),
    fetchBlogEntries(),
  ]);

  return [...staticRoutes, ...projectEntries, ...blogEntries];
}
