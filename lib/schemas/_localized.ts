import { z } from "zod";

export const LocalizedText = z.object({
  en: z.string(),
  es: z.string().default(""),
});

export const LocalizedList = z.object({
  en: z.array(z.string()).default([]),
  es: z.array(z.string()).default([]),
});

export type LocalizedText = z.infer<typeof LocalizedText>;
export type LocalizedList = z.infer<typeof LocalizedList>;
