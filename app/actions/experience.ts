"use server";
import { cookies } from "next/headers";
import { ApiExperience, ExperienceCreate, ExperienceUpdate } from "@/lib/api";

export type ServerActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createExperienceAction(
  data: ExperienceCreate,
): Promise<ServerActionResponse<ApiExperience>> {
  try {
    const res = await fetch(`${API_BASE_URL}/experience`, {
      method: "POST",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.detail || "Failed to create experience" };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateExperienceAction(
  id: string,
  data: ExperienceUpdate,
): Promise<ServerActionResponse<ApiExperience>> {
  try {
    const res = await fetch(`${API_BASE_URL}/experience/${id}`, {
      method: "PATCH",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.detail || "Failed to update experience" };
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteExperienceAction(id: string): Promise<ServerActionResponse<void>> {
  try {
    const res = await fetch(`${API_BASE_URL}/experience/${id}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
    });
    if (!res.ok) {
      const json = await res.json();
      return { success: false, error: json.detail || "Failed to delete experience" };
    }
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
