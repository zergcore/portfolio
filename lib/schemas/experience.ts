import { z } from "zod";
import { LocalizedText, LocalizedList } from "./_localized";

export const ExperienceCreate = z.object({
  role: LocalizedText,
  company: z.string().min(1, "Company is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().default(null),
  is_current: z.boolean().default(false),
  description: LocalizedList,
  tech_stack: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
}).refine(
  (v) => !v.is_current || v.end_date === null,
  { message: "If 'Currently here' is checked, end date must be empty.", path: ["end_date"] },
).refine(
  (v) => v.end_date === null || v.end_date >= v.start_date,
  { message: "End date must be after start date.", path: ["end_date"] },
);

export type ExperienceCreate = z.infer<typeof ExperienceCreate>;
