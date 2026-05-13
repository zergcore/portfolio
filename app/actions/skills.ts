"use server";
import { cookies } from "next/headers";

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

export async function createSkillAction(data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`, {
      method: "POST",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to create skill" };
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updateSkillAction(id: string, data: Record<string, unknown>) {
  try {
    const res = await fetch(`${API_BASE_URL}/skills/${id}`, {
      method: "PATCH",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.detail || "Failed to update skill" };
    return { success: true, data: json };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function deleteSkillAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/skills/${id}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
    });
    if (!res.ok) {
      const json = await res.json();
      return { error: json.detail || "Failed to delete skill" };
    }
    return { success: true };
  } catch (err) {
    return { error: err };
  }
}
