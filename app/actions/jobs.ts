"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function authHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface PollSourceStat {
  source: string;
  fetched: number;
  new: number;
  error: boolean;
  skipped?: boolean;
}

export interface PollStatusResult {
  new_jobs: number;
  sources_polled: number;
  sources_skipped_today?: number;
  failures: string[];
  source_stats?: PollSourceStat[];
}

export interface PollState {
  running: boolean;
  started_at: number | null;
  result: PollStatusResult | null;
  jobs_found_so_far: number;
  stop_requested: boolean;
}

export async function getPollStatusAction(): Promise<{ success: true; data: PollState } | { error: string }> {
  const token = process.env.JOBS_POLL_TOKEN;
  if (!token) return { error: "JOBS_POLL_TOKEN is not configured on the server." };
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/poll-status`, {
      headers: { "X-Jobs-Poll-Token": token },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to get poll status" };
    return { success: true, data: json as PollState };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function stopPollAction(): Promise<{ success: true } | { error: string }> {
  const token = process.env.JOBS_POLL_TOKEN;
  if (!token) return { error: "JOBS_POLL_TOKEN is not configured on the server." };
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/poll-stop`, {
      method: "POST",
      headers: { "X-Jobs-Poll-Token": token },
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to stop poll" };
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function pollJobsAction() {
  const token = process.env.JOBS_POLL_TOKEN;
  if (!token) return { error: "JOBS_POLL_TOKEN is not configured on the server." };
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/poll-now`, {
      method: "POST",
      headers: {
        "X-Jobs-Poll-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Poll failed" };
    revalidatePath("/admin/jobs");
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function loadMoreJobsAction(offset: number, limit: number = 500) {
  try {
    const url = new URL(`${API_BASE_URL}/jobs`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    const res = await fetch(url.toString(), {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.detail || "Failed to load more jobs" };
    }
    return { success: true, data: await res.json() };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updateJobAction(
  id: string,
  data: { status?: string; cover_letter_text?: string | null; notes?: string | null; follow_up_at?: string | null },
) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to update job" };
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${id}`);
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function getJobAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to fetch job" };
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function renderCvPdfAction(cvVersionId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/cv/${cvVersionId}/render-pdf`, {
      method: "POST",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to render PDF" };
    return { success: true, data: json as { pdf_url: string } };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function renderCoverLetterPdfAction(cvVersionId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/cv/cover-letter/${cvVersionId}/render-pdf`, {
      method: "POST",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to render cover letter PDF" };
    return { success: true, data: json as { pdf_url: string } };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function generateJobCvAction(
  id: string,
  body: {
    locale?: "auto" | "en" | "es";
    bullets_per_role?: number;
    page_size?: "Letter" | "A4";
    mode?: "full" | "one_page";
    ai_rewrite?: boolean;
  } = {},
) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/generate-cv`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to generate CV" };
    revalidatePath(`/admin/jobs/${id}`);
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function generateJobCoverLetterAction(
  id: string,
  body: { locale?: "auto" | "en" | "es"; page_size?: "Letter" | "A4" } = {},
) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/generate-cover-letter`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to generate cover letter" };
    revalidatePath(`/admin/jobs/${id}`);
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function qaJobAction(
  id: string,
  body: { question: string; hint?: string; locale?: "auto" | "en" | "es" },
) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/qa`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ locale: "auto", hint: "", ...body }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to generate answer" };
    return { success: true, data: json as { question: string; answer: string } };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function createJobSourceAction(data: {
  platform: string;
  identifier: string;
  enabled?: boolean;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/sources`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to create source" };
    revalidatePath("/admin/jobs/sources");
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updateJobSourceAction(
  id: string,
  data: { platform?: string; identifier?: string; enabled?: boolean },
) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/sources/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to update source" };
    revalidatePath("/admin/jobs/sources");
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function deleteJobSourceAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/sources/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => ({}));
      return { error: json.detail || "Failed to delete source" };
    }
    revalidatePath("/admin/jobs/sources");
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

export interface SourceTestResult {
  ok: boolean;
  count: number;
  sample: { title: string; company: string; url: string }[];
  error: string;
}

export async function testJobSourceAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/sources/${id}/test`, {
      method: "POST",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Test failed" };
    return { success: true, data: json as SourceTestResult };
  } catch (err) {
    return { error: String(err) };
  }
}

export interface DiscoveryHit {
  name: string;
  platform: string;
  slug: string;
  jobs_count: number;
  url: string;
}

export async function discoverSourcesAction(names: string[]) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/discover`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ names }),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Discovery failed" };
    return { success: true, data: json as DiscoveryHit[] };
  } catch (err) {
    return { error: String(err) };
  }
}

export interface DiscoveredSourceRow {
  id: string;
  platform: string;
  slug: string;
  hint: string | null;
  discovered_at: string;
  last_seen_at: string;
  times_seen: number;
  dismissed_at: string | null;
  promoted_source_id: string | null;
}

export interface CataloguePlatform {
  code: string;
  display_name: string;
  kind: "company_slug" | "search_query" | "tag" | "category";
  has_adapter: boolean;
  host_pattern: string | null;
  slug_regex: string | null;
  docs_url: string;
  notes: string;
}

export interface DiscoveryCatalogue {
  platforms: CataloguePlatform[];
  harvest_query_budget?: number;
  harvest_cooldown_seconds?: number;
  google_cse_free_tier_per_day?: number;
}

export async function getDiscoveryCatalogueAction() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/discover/catalogue`, {
      headers: await authHeaders(),
      cache: "force-cache",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.detail || "Failed to load catalogue" };
    }
    return { success: true, data: (await res.json()) as DiscoveryCatalogue };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function harvestInboxAction(force = false) {
  try {
    const url = new URL(`${API_BASE_URL}/jobs/discover/harvest`);
    if (force) url.searchParams.set("force", "true");
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (res.status === 429) {
      // Backend cooldown — surface the structured detail so the UI can offer override.
      const detail = json.detail ?? {};
      return {
        error: detail.message || "Harvest cooldown active",
        cooldown: true,
        cooldownSecondsRemaining: detail.cooldown_seconds_remaining ?? 0,
      };
    }
    if (!res.ok) return { error: json.detail || "Harvest failed" };
    return { success: true, data: json as Record<string, unknown> };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function listDiscoveryInboxAction() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/discover/inbox`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: json.detail || "Failed to load inbox" };
    }
    return { success: true, data: (await res.json()) as DiscoveredSourceRow[] };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function promoteDiscoveredAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/discover/inbox/${id}/promote`, {
      method: "POST",
      headers: await authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Promote failed" };
    revalidatePath("/admin/jobs/sources");
    revalidatePath("/admin/jobs/discover/inbox");
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function dismissDiscoveredAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/discover/inbox/${id}/dismiss`, {
      method: "POST",
      headers: await authHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => ({}));
      return { error: json.detail || "Dismiss failed" };
    }
    revalidatePath("/admin/jobs/discover/inbox");
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}
