import type { Stage } from "@/app/admin/(dashboard)/cv/generate/page";

export const LANG_LABEL: Record<"en" | "es", string> = {
  en: "English",
  es: "Español",
};

export const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  analyzing: "Analyzing JD…",
  analyzed: "Confirm and generate",
  generating: "Generating…",
  done: "Done",
  error: "",
};

export const LOCALE_LABEL: Record<"en" | "es", string> = {
  en: "English",
  es: "Español",
};

export const MAX_QUESTIONS = 10;
