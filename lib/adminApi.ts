import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Authorization": `Bearer ${token}`
  };
}

export async function getAdminProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminBlogPosts() {
  // We hit the same endpoint but without is_published filter (backend usually handles this via auth/query)
  // Wait, looking at blog.py, list_posts only shows published posts.
  // I should probably add an admin-only endpoint to list all posts or add a param.
  
  // For now, let's just use the public one but we'll need the backend to support showing drafts for admins.
  const res = await fetch(`${API_BASE_URL}/blog/admin`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export async function getAdminExperience() {
  const res = await fetch(`${API_BASE_URL}/experience`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminSkills() {
  const res = await fetch(`${API_BASE_URL}/skills/admin`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminSkillCategories() {
  const res = await fetch(`${API_BASE_URL}/skill-categories`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminEducation() {
  const res = await fetch(`${API_BASE_URL}/education`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminContacts() {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminContact(id: string) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 }
  });
  if (!res.ok) return null;
  const contacts = await res.json();
  return contacts.find((c: { id: string }) => c.id === id) || null;
}

export async function replyToContact(id: string, message: string) {
  const res = await fetch(`${API_BASE_URL}/contact/${id}/reply`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to send reply");
  }
  return res.json();
}

export async function linkedinPreview(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const res = await fetch(`${API_BASE_URL}/imports/linkedin/preview`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Preview failed (${res.status})`);
  }
  return res.json();
}

export async function linkedinApply(payload: {
  import_session_id: string;
  actions: { row_id: string; action: "create" | "merge" | "skip"; target_id?: string }[];
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const res = await fetch(`${API_BASE_URL}/imports/linkedin/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Apply failed (${res.status})`);
  }
  return res.json();
}


// ── CV Generator ────────────────────────────────────────────────────────────

export interface CvGenerateRequest {
  jd_text?: string;
  jd_url?: string;
  locale: "en" | "es";
  bullets_per_role?: number;
  page_size?: "Letter" | "A4";
  mode?: "full" | "one_page";
  ai_rewrite?: boolean;
  confirmed_keywords?: string[];
}

export interface CvGenerateResponse {
  cv_version_id: string;
  html: string;
  jd_structured: Record<string, unknown>;
  detected_language: string;
  warning?: string | null;
}

export interface CvAnalyzeRequest {
  jd_text?: string;
  jd_url?: string;
}

export interface CvAnalyzeResponse {
  jd_text: string;
  jd_structured: Record<string, unknown>;
  detected_language: "en" | "es";
  missing_keywords: string[];
  present_keywords: string[];
}

export interface CvConfirmSkillsResponse {
  created: string[];
  already_existed: string[];
}

export async function analyzeJd(payload: CvAnalyzeRequest): Promise<CvAnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/analyze-jd`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `JD analysis failed (${res.status})`);
  }
  return res.json();
}

export interface CoverLetterRequest {
  jd_text?: string;
  jd_url?: string;
  locale: "en" | "es";
  page_size?: "Letter" | "A4";
  confirmed_keywords?: string[];
}

export interface CoverLetterResponse {
  cover_letter_id: string;
  html: string;
  jd_structured: Record<string, unknown>;
  detected_language: string;
  body: string;
}

export async function generateCoverLetter(payload: CoverLetterRequest): Promise<CoverLetterResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/cover-letter/generate`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Cover letter generation failed (${res.status})`);
  }
  return res.json();
}

export async function renderCoverLetterPdf(clId: string): Promise<{ pdf_url: string }> {
  const res = await fetch(`${API_BASE_URL}/cv/cover-letter/${clId}/render-pdf`, {
    method: "POST",
    headers: await getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `PDF render failed (${res.status})`);
  }
  return res.json();
}

// ── Q&A responder ───────────────────────────────────────────────────

export interface QaQuestionInput {
  question: string;
  hint?: string;
}

export interface QaAnswerRequest {
  jd_text?: string;
  jd_url?: string;
  locale: "en" | "es";
  questions: (string | QaQuestionInput)[];
  confirmed_keywords?: string[];
}

export interface QaAnswerPair {
  question: string;
  answer: string;
  hint?: string;
}

export interface QaAnswerResponse {
  qa_session_id: string;
  answers: QaAnswerPair[];
  html: string;
  jd_structured: Record<string, unknown>;
  detected_language: string;
}

export interface QaRegenerateRequest {
  question_index: number;
  hint?: string;
  confirmed_keywords?: string[];
}

export interface QaRegenerateResponse {
  question_index: number;
  pair: QaAnswerPair;
}

export async function answerJdQuestions(payload: QaAnswerRequest): Promise<QaAnswerResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/qa-answer`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Q&A generation failed (${res.status})`);
  }
  return res.json();
}

export async function regenerateQaAnswer(
  sessionId: string,
  payload: QaRegenerateRequest,
): Promise<QaRegenerateResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/qa-answer/${sessionId}/regenerate`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Regeneration failed (${res.status})`);
  }
  return res.json();
}

export async function confirmCvSkills(skills: string[]): Promise<CvConfirmSkillsResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/confirm-skills`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ skills }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Confirm skills failed (${res.status})`);
  }
  return res.json();
}

export async function generateCv(payload: CvGenerateRequest): Promise<CvGenerateResponse> {
  const res = await fetch(`${API_BASE_URL}/cv/generate`, {
    method: "POST",
    headers: {
      ...(await getAuthHeader()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `CV generation failed (${res.status})`);
  }
  return res.json();
}

export async function getAdminJobs(params?: {
  status?: string;
  minScore?: number;
  limit?: number;
  offset?: number;
}) {
  const url = new URL(`${API_BASE_URL}/jobs`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.minScore !== undefined)
    url.searchParams.set("min_score", String(params.minScore));
  if (params?.limit !== undefined)
    url.searchParams.set("limit", String(params.limit));
  if (params?.offset !== undefined)
    url.searchParams.set("offset", String(params.offset));
  const res = await fetch(url.toString(), {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminJobHistory() {
  const res = await fetch(`${API_BASE_URL}/jobs/history`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminJobCvVersions(id: string) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}/cv-versions`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminJob(id: string) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAdminJobSources() {
  const res = await fetch(`${API_BASE_URL}/jobs/sources`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getAdminJobPlatforms() {
  const res = await fetch(`${API_BASE_URL}/jobs/platforms`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getJobStats() {
  const res = await fetch(`${API_BASE_URL}/jobs/stats`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Notifications ────────────────────────────────────────────────────────────

export interface ApiNotification {
  id: string;
  type: "poll_complete" | "high_match_job";
  title: string;
  body: string;
  job_id: string | null;
  created_at: string;
  read_at: string | null;
}

export async function getNotifications(): Promise<ApiNotification[]> {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: await getAuthHeader(),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: await getAuthHeader(),
  });
}

export async function renderCvPdf(cvVersionId: string): Promise<{ pdf_url: string }> {
  const res = await fetch(`${API_BASE_URL}/cv/${cvVersionId}/render-pdf`, {
    method: "POST",
    headers: await getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `PDF render failed (${res.status})`);
  }
  return res.json();
}

export async function getAiConfig() {
  const res = await fetch(`${API_BASE_URL}/ai/config`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAiKnownModels() {
  const res = await fetch(`${API_BASE_URL}/ai/models`, {
    headers: await getAuthHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

