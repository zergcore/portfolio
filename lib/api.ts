import {
  Project,
  ExperienceItem,
  SkillCategory,
  EducationItem,
  CertificationItem,
  BlogPost,
} from "./mockData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

// --- API Response Interfaces (Snake Case) ---

export interface LocalizedText {
  en: string;
  es: string;
}

export interface ApiProjectImage {
  url: string;
  public_id: string;
  is_primary: boolean;
}

export interface ApiSkillRef {
  id: string;
  name: LocalizedText;
  category_id: string | null;
}

export interface ApiProject {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  images: ApiProjectImage[] | null;
  // Deprecated (read-only post-migration)
  image_url: string | null;
  gallery: string[] | null;
  tags: string[] | null;
  github_url: string | null;
  live_url: string | null;
  role: LocalizedText | null;
  timeline: string | null;
  problem: LocalizedText | null;
  approach: Array<{ heading: LocalizedText; body: LocalizedText }> | null;
  outcomes: { en: string[]; es: string[] } | null;
  is_featured: boolean;
  sort_order: number;
  primary_category_id: string | null;
  skills: ApiSkillRef[];
}

export interface ApiProjectGroup {
  key: string;
  label: LocalizedText;
  items: ApiProject[];
}

export type ProjectCreate = Omit<ApiProject, "id" | "skills"> & {
  skill_ids?: string[];
};
export type ProjectUpdate = Partial<ProjectCreate>;

export interface ApiBlogPost {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  tags: string[] | null;
  reading_time: string | null;
  is_published: boolean;
  published_at: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogCreate = Omit<
  ApiBlogPost,
  "id" | "created_at" | "updated_at" | "published_at"
>;
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

export type ExperienceCreate = Omit<ApiExperience, "id">;
export type ExperienceUpdate = Partial<ExperienceCreate>;

export interface ApiSkill {
  id: string;
  name: LocalizedText;
  category: string;
  category_id: string | null;
  years: number;
  tags: string[];
  sort_order: number;
}

export type SkillCreate = Omit<ApiSkill, "id">;
export type SkillUpdate = Partial<SkillCreate>;

export interface ApiSkillCategory {
  id: string;
  name: LocalizedText;
  sort_order: number;
}

export type SkillCategoryCreate = Omit<ApiSkillCategory, "id">;
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

export type EducationCreate = Omit<ApiEducation, "id">;
export type EducationUpdate = Partial<EducationCreate>;

export interface ApiProfile {
  id: string;
  name: string;
  title: LocalizedText;
  bio: LocalizedText;
  email: string;
  location: LocalizedText;
  github_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  cv_url: string | null;
  image_url: string | null;
  meeting_url: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Omit<ApiProfile, "id" | "created_at" | "updated_at">
>;

export interface Profile {
  name: string;
  title: LocalizedText;
  bio: LocalizedText;
  email: string;
  location: LocalizedText;
  githubUrl?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
  cvUrl?: string;
  imageUrl?: string;
  meetingUrl?: string;
  skills?: string[] | null;
}

// --- Grouped Read Interfaces ---

export interface ApiSkillGroup {
  name: LocalizedText | string;
  skills: ApiSkill[];
}

// --- Job Finder ---

export type JobStatus =
  | "prospected"
  | "tailored"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export const JOB_STATUSES: JobStatus[] = [
  "prospected",
  "tailored",
  "applied",
  "interviewing",
  "offer",
  "rejected",
];

export interface ApiJob {
  id: string;
  source: string;
  source_id: string;
  url: string;
  title: string;
  company: string;
  location: string | null;
  posted_at: string | null;
  jd_text: string;
  jd_structured: Record<string, unknown>;
  match_score: number;
  match_explanation: string;
  status: JobStatus;
  cover_letter_text: string | null;
  notes: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiJobStats {
  total: number;
  by_status: Record<string, number>;
  avg_match_score: number;
  applied_to_interview_rate: number;
  top_sources: { source: string; count: number }[];
  overdue_followups: number;
}

export interface ApiJobSourceHealth {
  last_poll_status: string | null;
  last_http_code: number | null;
  last_error: string | null;
  last_success_at: string | null;
  last_polled_at: string | null;
  jobs_found_last_run: number;
  total_jobs: number;
}

export interface ApiJobSource {
  id: string;
  platform: string;
  identifier: string;
  enabled: boolean;
  created_at: string;
  dormant_since: string | null;
  consecutive_empty_polls: number;
  last_error: string | null;
  health_status: string;
  last_new_count: number | null;
  health: ApiJobSourceHealth | null;
}

export interface ApiJobPlatform {
  code: string;
  display_name: string;
  enabled: boolean;
}

export interface ApiJobPlatformConfig {
  code: string;
  base_url_template: string;
  http_method: string;
  request_body: Record<string, unknown> | null;
  auth_header_name: string | null;
  auth_header_value_env: string | null;
  response_path: string;
  field_mapping: Record<string, string>;
  pagination: Record<string, unknown> | null;
  posted_at_format: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiCvVersion {
  id: string;
  kind: "cv" | "cv_one_page" | "cover_letter";
  locale: string;
  pdf_url: string | null;
  created_at: string;
}

// --- Helpers ---

/** Localized label for an ongoing role's end date. */
const PRESENT_LABEL: Record<string, string> = {
  en: "Present",
  es: "Presente",
};

/**
 * Format a date range as a human-readable string.
 * Locale-aware: month abbreviations and the ongoing label both reflect the
 * visitor's language (e.g. "ene. 2023 - Presente" for locale = "es").
 */
function formatDateRange(
  start: string | null,
  end: string | null,
  isCurrent: boolean,
  locale: string = "en",
): string {
  if (!start) return "";
  const bcp47 = locale === "es" ? "es-ES" : "en-US";
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(bcp47, {
      month: "short",
      year: "numeric",
    });
  const presentLabel = PRESENT_LABEL[locale] ?? PRESENT_LABEL.en;
  if (isCurrent) return `${fmt(start)} – ${presentLabel}`;
  if (!end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

// --- Public Data Fetchers ---

/**
 * Extract a locale-aware string from a LocalizedText field.
 * Falls back to English if the requested locale string is empty or missing,
 * then to the other locale, then to an empty string.
 */
export function getLocalizedText(
  field: LocalizedText | string | null | undefined,
  locale: string,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  const requested = field[locale as keyof LocalizedText];
  if (requested) return requested;
  // Graceful degradation: show EN if the requested locale has no translation yet
  return field.en || field.es || "";
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return null;

    const p: ApiProfile = await res.json();
    return {
      name: p.name,
      title: p.title || { en: "", es: "" },
      bio: p.bio || { en: "", es: "" },
      email: p.email,
      location: p.location || { en: "", es: "" },
      githubUrl: p.github_url || undefined,
      linkedinUrl: p.linkedin_url || undefined,
      whatsappNumber: p.whatsapp_number || undefined,
      cvUrl: p.cv_url || undefined,
      imageUrl: p.image_url || undefined,
      meetingUrl: p.meeting_url || undefined,
      skills: p.skills || undefined,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function updateProfile(
  data: ProfileUpdate,
  token: string,
): Promise<ApiProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

export async function submitContact(
  data: ContactSubmission,
): Promise<{ success: boolean; message: string }> {
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
        message:
          result.detail || "Failed to send message. Please try again later.",
      };
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error("Error submitting contact:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function uploadImage(
  file: File,
): Promise<{ url: string; public_id: string } | null> {
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
    return { url: result.url, public_id: result.public_id };
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export function mapApiProject(p: ApiProject, locale: string = "en"): Project {
  const primaryImage =
    p.images?.find((img) => img.is_primary)?.url ||
    p.image_url ||
    "/placeholder-project.svg";
  const loc = (f: LocalizedText | string | null | undefined) =>
    getLocalizedText(f, locale);
  return {
    id: p.id,
    slug: p.slug,
    title: loc(p.title),
    description: loc(p.description),
    imageUrl: primaryImage,
    images: p.images || [],
    tags: p.tags || [],
    githubUrl: p.github_url || undefined,
    liveUrl: p.live_url || undefined,
    caseStudyUrl: p.problem || p.role ? `/projects/${p.slug}` : undefined,
    role: p.role ? loc(p.role) : undefined,
    timeline: p.timeline || undefined,
    problem: p.problem ? loc(p.problem) : undefined,
    approach: p.approach?.map((s) => ({
      heading: loc(s.heading),
      body: loc(s.body),
    })),
    outcomes:
      locale === "es" ? (p.outcomes?.es ?? p.outcomes?.en) : p.outcomes?.en,
    gallery: p.gallery || [],
    is_featured: p.is_featured,
    sort_order: p.sort_order,
    skillIds: p.skills?.map((s) => s.id) || [],
  };
}

export async function getProjects(params?: {
  featured?: boolean;
  skills?: string[];
  locale?: string;
}): Promise<Project[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (params?.featured !== undefined)
      url.searchParams.set("featured", params.featured.toString());
    if (params?.skills?.length)
      url.searchParams.set("skills", params.skills.join(","));
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    const locale = params?.locale ?? "en";
    return data.map((p: ApiProject) => mapApiProject(p, locale));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectsRaw(params?: {
  featured?: boolean;
  skills?: string[];
}): Promise<ApiProject[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (params?.featured !== undefined)
      url.searchParams.set("featured", params.featured.toString());
    if (params?.skills?.length)
      url.searchParams.set("skills", params.skills.join(","));
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as ApiProject[];
  } catch (error) {
    console.error("Error fetching projects raw:", error);
    return [];
  }
}

export async function getProjectsGrouped(params: {
  skills?: string[];
  group: "category" | "primary_skill";
}): Promise<ApiProjectGroup[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    url.searchParams.set("group", params.group);
    if (params.skills?.length)
      url.searchParams.set("skills", params.skills.join(","));
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.groups as ApiProjectGroup[]) ?? [];
  } catch (error) {
    console.error("Error fetching grouped projects:", error);
    return [];
  }
}

export async function getSkillsFlat(): Promise<ApiSkill[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((g: ApiSkillGroup) => g.skills);
  } catch (error) {
    console.error("Error fetching skills flat:", error);
    return [];
  }
}

export async function getProjectBySlug(
  slug: string,
  locale: string = "en",
): Promise<Project | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const p: ApiProject = await res.json();
    return mapApiProject(p, locale);
  } catch (error) {
    console.error(`Error fetching project ${slug}:`, error);
    return null;
  }
}

export async function getExperience(
  locale: string = "en",
): Promise<ExperienceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/experience`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((e: ApiExperience) => {
      // description is { en: string[]; es: string[] } — use bracket access with
      // an English fallback so an empty translated array degrades gracefully.
      const localizedDesc: string[] =
        (e.description?.[locale as keyof typeof e.description] ?? []).length > 0
          ? (e.description[locale as keyof typeof e.description] ?? [])
          : (e.description?.en ?? []);

      return {
        id: e.id,
        role: getLocalizedText(e.role, locale),
        company: e.company,
        dateRange: formatDateRange(e.start_date, e.end_date, e.is_current, locale),
        description: localizedDesc,
        techStack: e.tech_stack,
      };
    });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return [];
  }
}

export async function getSkills(
  locale: string = "en",
): Promise<SkillCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((g: ApiSkillGroup) => ({
      title: getLocalizedText(g.name, locale),
      skills: g.skills.map((s) => ({
        name: getLocalizedText(s.name, locale),
        years: s.years,
        tags: s.tags || [],
      })),
    }));
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

export async function getEducation(
  locale: string = "en"
): Promise<{
  degrees: EducationItem[];
  certifications: CertificationItem[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/education`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return { degrees: [], certifications: [] };

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { degrees: [], certifications: [] };
    }

    const degrees = data
      .filter((e) => e.type === "degree")
      .map((e) => ({
        id: e.id,
        degree: getLocalizedText(e.degree, locale),
        institution: e.institution,
        dateRange: formatDateRange(e.start_date, e.end_date, e.is_current, locale),
        description: getLocalizedText(e.description, locale),
        imageUrl: e.image_url || undefined,
        relatedProjectIds: e.related_project_ids || undefined,
        status: e.status || undefined,
        status_note: e.status_note || undefined,
      }));

    const certifications = data
      .filter((e) => e.type === "certification")
      .map((e) => ({
        id: e.id,
        name: getLocalizedText(e.degree, locale),
        issuer: e.institution,
        date: formatDateRange(e.start_date, null, false, locale),
        url: e.url || undefined,
        imageUrl: e.image_url || undefined,
        relatedProjectIds: e.related_project_ids || undefined,
      }));

    return { degrees, certifications };
  } catch (error) {
    console.error("Error fetching education:", error);
    return { degrees: [], certifications: [] };
  }
}

export async function getBlogPosts(locale: string = "en"): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return [];

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;

    if (!Array.isArray(items)) return [];

    return items.map((b: ApiBlogPost) => ({
      id: b.id,
      slug: b.slug,
      title: getLocalizedText(b.title, locale),
      excerpt: getLocalizedText(b.excerpt, locale),
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: getLocalizedText(b.content, locale),
      imageUrl: b.image_url || undefined,
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
  locale: string = "en",
): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/${slug}`, {
      next: { revalidate: 60 },
    } as NextFetchOptions);
    if (!res.ok) return null;

    const b: ApiBlogPost = await res.json();
    return {
      id: b.id,
      slug: b.slug,
      title: getLocalizedText(b.title, locale),
      excerpt: getLocalizedText(b.excerpt, locale),
      date: b.published_at || b.created_at,
      readingTime: b.reading_time || "5 min read",
      tags: b.tags || [],
      content: getLocalizedText(b.content, locale),
      imageUrl: b.image_url || undefined,
    };
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error);
    return null;
  }
}
