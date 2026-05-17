"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export interface QueueItem {
  entity: string;
  record_id: string;
  field: string;
  label: string;
  source_locale: "en" | "es";
  target_locale: "en" | "es";
  source_text: string;
  current_text: string;
  draft_text: string;
  skipped: boolean;
}

async function authHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getTranslationQueue(entity?: string): Promise<QueueItem[]> {
  const url = `${API_BASE}/translations/queue${entity ? `?entity=${entity}` : ""}`;
  try {
    const res = await fetch(url, { headers: await authHeaders(), cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateDraftAction(
  entity: string,
  record_id: string,
  field: string,
  en_text: string,
): Promise<{ success: true; es_text: string } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/translations/draft`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ entity, record_id, field, en_text }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.detail ?? "Failed to generate draft" };
    }
    const { es_text } = await res.json();
    return { success: true, es_text };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function skipFieldAction(
  entity: string,
  record_id: string,
  field: string,
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/translations/skip`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ entity, record_id, field }),
    });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

export async function saveTranslationAction(
  entity: string,
  record_id: string,
  field: string,
  target_locale: "en" | "es",
  translated_text: string,
): Promise<{ success: boolean; error?: string }> {
  const entityToPath: Record<string, string> = {
    profiles:         "profile",
    experiences:      `experience/${record_id}`,
    education:        `education/${record_id}`,
    projects:         `projects/${record_id}`,
    blog_posts:       `blog/${record_id}`,
    skill_categories: `skill-categories/${record_id}`,
  };

  const path = entityToPath[entity];
  if (!path) return { success: false, error: `Unknown entity: ${entity}` };

  try {
    const body: Record<string, unknown> = {};
    body[field] = { [target_locale]: translated_text };

    const res = await fetch(`${API_BASE}/${path}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { success: false, error: json.detail ?? "Save failed" };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
