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
  data: { identifier?: string; enabled?: boolean },
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
