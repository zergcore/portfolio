import { z } from "zod";
import { LocalizedText } from "./_localized";

export const BlogCreate = z.object({
  title: LocalizedText,
  slug: z.string().min(1, "Slug is required"),
  excerpt: LocalizedText,
  content: LocalizedText,
  tags: z.string().default(""),
  reading_time: z.string().default("5 min read"),
  is_published: z.boolean().default(false),
});

export type BlogCreate = z.infer<typeof BlogCreate>;
