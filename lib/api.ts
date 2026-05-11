import { Project, ExperienceItem, SkillCategory, EducationItem, CertificationItem, BlogPost } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

type NextFetchOptions = RequestInit & { 
  next?: { 
    revalidate?: number | false; 
    tags?: string[] 
  } 
};

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
  title: { en: string; es: string };
  excerpt: { en: string; es: string };
  content: { en: string; es: string };
  tags: string[] | null;
  reading_time: string | null;
  is_published: boolean;
  published_at: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogCreate = Omit<ApiBlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>;
export type BlogUpdate = Partial<BlogCreate>;

export interface ApiExperience {
  id: string;
  role: { en: string; es: string };
  company: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: { en: string[]; es: string[] };
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
  name: { en: string; es: string };
  sort_order: number;
}

export type SkillCategoryCreate = Omit<ApiSkillCategory, 'id'>;
export type SkillCategoryUpdate = Partial<SkillCategoryCreate>;

export interface ApiEducation {
  id: string;
  type: "degree" | "certification";
  degree: { en: string; es: string };
  institution: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  status: "in_course" | "graduated" | "unfinished" | null;
  status_note: string | null;
  description: { en: string; es: string };
  image_url: string | null;
  url: string | null;
  related_project_ids: string[] | null;
  sort_order: number;
}

export type EducationCreate = Omit<ApiEducation, 'id'>;
export type EducationUpdate = Partial<EducationCreate>;

export interface ApiProfile {
  id: string;
  name: string;
  title: { en: string; es: string };
  bio: { en: string; es: string };
  email: string;
  location: { en: string; es: string };
  github_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  cv_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<Omit<ApiProfile, 'id' | 'created_at' | 'updated_at'>>;

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  githubUrl?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
  cvUrl?: string;
  imageUrl?: string;
}

// --- Grouped Read Interfaces ---

export interface ApiSkillGroup {
  name: { en: string; es: string };
  skills: ApiSkill[];
}

// --- Helpers ---

function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent: boolean,
): string {
  if (!start) return "";
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
  if (isCurrent) return `${fmt(start)} – Present`;
  if (!end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

// --- Public Data Fetchers ---

export async function getProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return null;
    
    const p: ApiProfile = await res.json();
    return {
      name: p.name,
      title: p.title?.en ?? "",
      bio: p.bio?.en ?? "",
      email: p.email,
      location: p.location?.en ?? "",
      githubUrl: p.github_url || undefined,
      linkedinUrl: p.linkedin_url || undefined,
      whatsappNumber: p.whatsapp_number || undefined,
      cvUrl: p.cv_url || undefined,
      imageUrl: p.image_url || undefined,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfile(data: ProfileUpdate, token: string): Promise<ApiProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject?: string;
  message: string;
  honey?: string;
}

export async function submitContact(data: ContactSubmission): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      return { 
        success: false, 
        message: result.detail || "Failed to send message. Please try again later." 
      };
    }
    
    return { success: true, message: result.message };
  } catch (error) {
    console.error("Error submitting contact:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Upload failed");
    }

    const result = await res.json();
    return result.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function getProjects(featured?: boolean): Promise<Project[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (featured !== undefined) {
      url.searchParams.append("featured", featured.toString());
    }
    const res = await fetch(url.toString(), { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((p: ApiProject) => ({
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
    const res = await fetch(`${API_BASE_URL}/experience`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((e: ApiExperience) => ({
      id: e.id,
      role: e.role?.en ?? "",
      company: e.company,
      dateRange: formatDateRange(e.start_date, e.end_date, e.is_current),
      description: e.description?.en ?? [],
      techStack: e.tech_stack,
    }));
  } catch (error) {
    console.error("Error fetching experience:", error);
    return [];
  }
}

export async function getSkills(): Promise<SkillCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((g: ApiSkillGroup) => ({
      title: g.name?.en ?? "",
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
    const res = await fetch(`${API_BASE_URL}/education`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return { degrees: [], certifications: [] };
    
    const data = await res.json();
    if (!Array.isArray(data)) {
      return { degrees: [], certifications: [] };
    }

    const degrees = data
      .filter(e => e.type === "degree")
      .map(e => ({
        id: e.id,
        degree: e.degree?.en ?? "",
        institution: e.institution,
        dateRange: formatDateRange(e.start_date, e.end_date, e.is_current),
        description: e.description?.en ?? "",
      }));

    const certifications = data
      .filter(e => e.type === "certification")
      .map(e => ({
        id: e.id,
        name: e.degree?.en ?? "",
        issuer: e.institution,
        date: formatDateRange(e.start_date, null, false),
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
    const res = await fetch(`${API_BASE_URL}/blog`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return [];
    
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    
    if (!Array.isArray(items)) return [];

    return items.map((b: ApiBlogPost) => ({
      id: b.id,
      slug: b.slug,
      title: b.title?.en ?? "",
      excerpt: b.excerpt?.en ?? "",
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: b.content?.en ?? "",
      imageUrl: b.image_url || undefined,
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/${slug}`, { next: { revalidate: 60 } } as NextFetchOptions);
    if (!res.ok) return null;
    
    const b: ApiBlogPost = await res.json();
    return {
      id: b.id,
      slug: b.slug,
      title: b.title?.en ?? "",
      excerpt: b.excerpt?.en ?? "",
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: b.content?.en ?? "",
      imageUrl: b.image_url || undefined,
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}


