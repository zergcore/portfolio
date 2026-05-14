export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  images?: { url: string; public_id: string; is_primary: boolean }[];
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  skillIds?: string[];
  role?: string;
  timeline?: string;
  problem?: string;
  approach?: CaseStudySection[];
  outcomes?: string[];
  gallery?: string[];
  is_featured?: boolean;
  sort_order?: number;
}

export interface SkillItem {
  name: string;
  years: number;
  tags?: string[];
}

export interface SkillCategory {
  title: string;
  skills: SkillItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  dateRange: string;
  description: string[];
  techStack: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  dateRange: string;
  description: string;
  imageUrl?: string;
  relatedProjectIds?: string[];
  status?: "in_course" | "graduated" | "unfinished";
  status_note?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  imageUrl?: string;
  relatedProjectIds?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  date: string;
  slug: string;
  content?: string;
  isPublished?: boolean;
  imageUrl?: string | null;
}
