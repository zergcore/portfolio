"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function authHeader() {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return { Authorization: `Bearer ${token}` };
}

export async function getApplicationPreferences() {
  const res = await fetch(`${API_BASE}/application-preferences`, {
    headers: await authHeader(),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateApplicationPreferencesAction(
  data: Record<string, unknown>,
) {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return { error: "Not authenticated" };

  const res = await fetch(`${API_BASE}/application-preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { error: detail || "Failed to save preferences" };
  }

  revalidatePath("/admin/preferences");
  return { success: true, data: await res.json() };
}
