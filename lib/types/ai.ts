export type RewriteFieldKind = "bullet" | "paragraph" | "title";
export type RewriteStyle = "shorter" | "technical" | "friendlier";
export type RewriteMode = "rewrite" | "translate" | "suggest" | "suggest_tags" | "suggest_skills";

export interface RewriteOptions {
  text: string;
  locale: "en" | "es";
  fieldKind: RewriteFieldKind;
  style?: RewriteStyle | null;
  mode?: RewriteMode;
  targetLocale?: "en" | "es";
  availableSkills?: string[];
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export interface AiCallRow {
  feature: string;
  provider: string;
  model: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  succeeded: boolean;
  created_at: string;
}

export interface AiModelStat {
  feature: string;
  provider: string;
  model: string;
  call_count: number;
  avg_latency_ms: number | null;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
}

export interface AiUsageData {
  calls: AiCallRow[];
  stats: AiModelStat[];
}
