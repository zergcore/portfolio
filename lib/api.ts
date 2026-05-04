import { Project, ExperienceItem, SkillCategory, EducationItem, CertificationItem, BlogPost } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface ApiProject {
  id: string; slug: string; title: string; description: string; image_url: string;
  tags?: string[]; github_url?: string; live_url?: string; role?: string;
  timeline?: string; problem?: string; approach?: { heading: string; body: string }[];
  outcomes?: string[]; gallery?: string[];
}

export async function getProjects(featured?: boolean): Promise<Project[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (featured !== undefined) {
      url.searchParams.append("featured", featured.toString());
    }
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    
    const data: ApiProject[] = await res.json();
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      imageUrl: p.image_url,
      tags: p.tags || [],
      githubUrl: p.github_url,
      liveUrl: p.live_url,
      caseStudyUrl: `/projects/${p.slug}`,
      role: p.role,
      timeline: p.timeline,
      problem: p.problem,
      approach: p.approach || [],
      outcomes: p.outcomes || [],
      gallery: p.gallery || [],
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    
    const p: ApiProject = await res.json();
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      imageUrl: p.image_url,
      tags: p.tags || [],
      githubUrl: p.github_url,
      liveUrl: p.live_url,
      caseStudyUrl: `/projects/${p.slug}`,
      role: p.role,
      timeline: p.timeline,
      problem: p.problem,
      approach: p.approach || [],
      outcomes: p.outcomes || [],
      gallery: p.gallery || [],
    };
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error);
    return null;
  }
}

interface ApiExperience {
  id: string; role: string; company: string; date_range: string;
  description?: string[]; tech_stack?: string[];
}

export async function getExperience(): Promise<ExperienceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/experience`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: ApiExperience[] = await res.json();
    return data.map((e) => ({
      id: e.id,
      role: e.role,
      company: e.company,
      dateRange: e.date_range,
      description: e.description || [],
      techStack: e.tech_stack || [],
    }));
  } catch (error) {
    console.error("Error fetching experience:", error);
    return [];
  }
}

export async function getSkills(): Promise<SkillCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json() as SkillCategory[];
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

interface ApiEducation {
  id: string; degree: string; institution: string; date_range: string;
  description: string; url?: string; image_url?: string; related_project_ids?: string[];
}

export async function getEducation(type: "degree" | "certification"): Promise<(EducationItem & CertificationItem)[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/education?type=${type}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: ApiEducation[] = await res.json();
    return data.map((e) => ({
      id: e.id,
      degree: e.degree,
      name: e.degree,
      issuer: e.institution,
      institution: e.institution,
      dateRange: e.date_range,
      date: e.date_range,
      description: e.description,
      url: e.url,
      imageUrl: e.image_url,
      relatedProjectIds: e.related_project_ids || [],
    })) as (EducationItem & CertificationItem)[];
  } catch (error) {
    console.error(`Error fetching education (${type}):`, error);
    return [];
  }
}

interface ApiBlogPost {
  id: string; slug: string; title: string; excerpt: string;
  tags?: string[]; reading_time: string; created_at?: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog?is_published=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data: { items: ApiBlogPost[] } = await res.json();
    return data.items.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      tags: b.tags || [],
      readingTime: b.reading_time,
      date: b.created_at?.split("T")[0] || "Recent",
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const b: ApiBlogPost = await res.json();
    return {
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      tags: b.tags || [],
      readingTime: b.reading_time,
      date: b.created_at?.split("T")[0] || "Recent",
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}
