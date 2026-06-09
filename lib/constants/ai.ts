export const CUSTOM_SENTINEL = "__custom__";

export const FEATURE_META: Record<
  string,
  { type: "generation" | "embed"; description: string }
> = {
  rewrite: { type: "generation", description: "AI-enhance CMS text fields" },
  translate: { type: "generation", description: "Translate content EN ↔ ES" },
  suggest: {
    type: "generation",
    description: "Suggest content for CMS fields",
  },
  suggest_tags: {
    type: "generation",
    description: "Suggest tags for blog posts",
  },
  suggest_skills: {
    type: "generation",
    description: "Suggest skills from job descriptions",
  },
  jd_parse: {
    type: "generation",
    description: "Parse job descriptions into structured data",
  },
  cv_select: {
    type: "generation",
    description: "Select relevant CV sections for a job",
  },
  cover_letter: {
    type: "generation",
    description: "Generate cover letters from CV + JD",
  },
  qa_responder: {
    type: "generation",
    description: "Answer application form questions",
  },
  job_explain: {
    type: "generation",
    description: "Explain job match scores in plain language",
  },
  detect_language: {
    type: "generation",
    description: "Detect language of job descriptions",
  },
  embed: {
    type: "embed",
    description:
      "Vector embeddings for job match scoring — embedding models only",
  },
};
