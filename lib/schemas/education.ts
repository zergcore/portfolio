import { z } from "zod";
import { LocalizedText } from "./_localized";

export const DegreeStatus = z.enum(["in_course", "graduated", "unfinished"]);

export const EducationCreate = z.object({
  type: z.enum(["degree", "certification"]).default("degree"),
  degree: LocalizedText,
  institution: z.string().min(1, "Institution is required"),
  start_date: z.string().nullable().default(null),
  end_date: z.string().nullable().default(null),
  is_current: z.boolean().default(false),
  status: DegreeStatus.nullable().default(null),
  status_note: z.string().max(200).nullable().default(null),
  description: LocalizedText.default({ en: "", es: "" }),
  image_url: z.string().nullable().default(null),
  url: z.string().nullable().default(null),
  related_project_ids: z.array(z.string()).nullable().default(null),
  sort_order: z.number().int().default(0),
}).refine(
  (v) => !v.is_current || v.end_date === null,
  { message: "If currently studying, end date must be empty.", path: ["end_date"] },
).refine(
  (v) => v.end_date === null || v.start_date === null || v.end_date >= v.start_date,
  { message: "End date must be after start date.", path: ["end_date"] },
);

export type EducationCreate = z.infer<typeof EducationCreate>;
