import { z } from "zod";
import { LocalizedText } from "./_localized";

export const ProjectCreate = z.object({
  title: LocalizedText,
  slug: z.string().min(1, "Slug is required"),
  description: LocalizedText,
  github_url: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  live_url: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export type ProjectCreate = z.infer<typeof ProjectCreate>;
