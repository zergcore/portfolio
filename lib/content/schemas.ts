import { z } from 'zod';

const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const LinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const ProjectFrontmatterSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  slug: z.string(),
  year: z.number().int(),
  tier: z.enum(['flagship', 'standard', 'archive']),
  order: z.number().int(),
  dek: z.string(),
  intro: z.string(),
  metrics: z.array(MetricSchema).optional(),
  stack: z.array(z.string()),
  links: z.array(LinkSchema).optional(),
  hasCaseStudy: z.boolean(),
  heroArtifact: z.string().optional(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export const EssayFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  dek: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export type EssayFrontmatter = z.infer<typeof EssayFrontmatterSchema>;

export const ExperienceFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  company: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM'),
  end: z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM').optional(),
  summary: z.string(),
  bullets: z.array(z.string()),
  stack: z.array(z.string()),
  metrics: z.array(MetricSchema).optional(),
  tier: z.enum(['flagship', 'standard', 'archive']),
});

export type ExperienceFrontmatter = z.infer<typeof ExperienceFrontmatterSchema>;

export const CredentialFrontmatterSchema = z.object({
  tier: z.enum(['degree', 'notable', 'archive']),
  title: z.string(),
  institution: z.string(),
  dates: z.string(),
  summary: z.string(),
  relatedProjects: z.array(z.string()).optional(),
});

export type CredentialFrontmatter = z.infer<typeof CredentialFrontmatterSchema>;

export type ContentEntry<T> = {
  frontmatter: T;
  content: string;
  slug: string;
};
