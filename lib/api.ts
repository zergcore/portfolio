import { Project, ExperienceItem, SkillCategory, EducationItem, CertificationItem, BlogPost } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// --- API Response Interfaces (Snake Case) ---

export interface ApiProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[] | null;
  github_url: string | null;
  live_url: string | null;
  role: string | null;
  timeline: string | null;
  problem: string | null;
  approach: { heading: string; body: string }[] | null;
  outcomes: string[] | null;
  gallery: string[] | null;
  is_featured: boolean;
  sort_order: number;
}

export type ProjectCreate = Omit<ApiProject, 'id'>;
export type ProjectUpdate = Partial<ProjectCreate>;

export interface ApiBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[] | null;
  reading_time: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogCreate = Omit<ApiBlogPost, 'id' | 'created_at' | 'updated_at'>;
export type BlogUpdate = Partial<BlogCreate>;

export interface ApiExperience {
  id: string;
  role: string;
  company: string;
  date_range: string;
  description: string[];
  tech_stack: string[];
  sort_order: number;
}

export type ExperienceCreate = Omit<ApiExperience, 'id'>;
export type ExperienceUpdate = Partial<ExperienceCreate>;

export interface ApiSkill {
  id: string;
  name: string;
  category: string;
  category_id: string | null;
  years: number;
  tags: string[];
  sort_order: number;
}

export type SkillCreate = Omit<ApiSkill, 'id'>;
export type SkillUpdate = Partial<SkillCreate>;

export interface ApiSkillCategory {
  id: string;
  name: string;
  sort_order: number;
}

export type SkillCategoryCreate = Omit<ApiSkillCategory, 'id'>;
export type SkillCategoryUpdate = Partial<SkillCategoryCreate>;

export interface ApiEducation {
  id: string;
  type: "degree" | "certification";
  degree: string;
  institution: string;
  date_range: string;
  description: string;
  image_url: string | null;
  url: string | null;
  related_project_ids: string[] | null;
  sort_order: number;
}

export type EducationCreate = Omit<ApiEducation, 'id'>;
export type EducationUpdate = Partial<EducationCreate>;

// --- Grouped Read Interfaces ---

export interface ApiSkillGroup {
  title: string;
  skills: ApiSkill[];
}

// --- Public Data Fetchers ---

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
      imageUrl: p.image_url || "/placeholder-project.jpg",
      tags: p.tags || [],
      githubUrl: p.github_url || undefined,
      liveUrl: p.live_url || undefined,
      role: p.role || undefined,
      timeline: p.timeline || undefined,
      problem: p.problem || undefined,
      approach: p.approach || undefined,
      outcomes: p.outcomes || undefined,
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
      imageUrl: p.image_url || "/placeholder-project.jpg",
      tags: p.tags || [],
      githubUrl: p.github_url || undefined,
      liveUrl: p.live_url || undefined,
      role: p.role || undefined,
      timeline: p.timeline || undefined,
      problem: p.problem || undefined,
      approach: p.approach || undefined,
      outcomes: p.outcomes || undefined,
      gallery: p.gallery || [],
    };
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error);
    return null;
  }
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
      description: e.description,
      techStack: e.tech_stack,
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
    
    const data: ApiSkillGroup[] = await res.json();
    return data.map((g) => ({
      title: g.title,
      skills: g.skills.map(s => ({
        name: s.name,
        years: s.years,
        tags: s.tags,
      }))
    }));
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

export async function getEducation(): Promise<{ degrees: EducationItem[], certifications: CertificationItem[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/education`, { next: { revalidate: 60 } });
    if (!res.ok) return { degrees: [], certifications: [] };
    
    const data: ApiEducation[] = await res.json();
    
    const degrees = data
      .filter(e => e.type === "degree")
      .map(e => ({
        id: e.id,
        degree: e.degree,
        institution: e.institution,
        dateRange: e.date_range,
        description: e.description,
      }));
      
    const certifications = data
      .filter(e => e.type === "certification")
      .map(e => ({
        id: e.id,
        name: e.degree,
        issuer: e.institution,
        date: e.date_range,
        url: e.url || undefined,
      }));
      
    return { degrees, certifications };
  } catch (error) {
    console.error("Error fetching education:", error);
    return { degrees: [], certifications: [] };
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    
    const data: ApiBlogPost[] = await res.json();
    return data.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: b.content,
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
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: b.content,
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}
