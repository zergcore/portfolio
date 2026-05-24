"use server";

import { cookies } from "next/headers";
import type { AiTestResult, AiUsageData } from "@/lib/types/ai";

export type { AiChainEntry, AiKnownModel, AiTestResult, AiUsageData } from "@/lib/types/ai";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export interface ProviderCreditInfo {
  openrouter?: {
    usage_usd?: number;
    limit_usd?: number | null;
    is_free_tier?: boolean;
    label?: string;
    error?: string;
  };
  groq?: { note: string; docs_url: string };
  google?: { note: string; docs_url: string };
}

export async function getProviderCredits(): Promise<ProviderCreditInfo | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/provider-credits`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<ProviderCreditInfo>;
  } catch {
    return null;
  }
}

export async function getAiUsage(): Promise<AiUsageData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const res = await fetch(`${API_BASE}/ai/usage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<AiUsageData>;
  } catch {
    return null;
  }
}

export async function testAiFeature(feature: string): Promise<AiTestResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const res = await fetch(`${API_BASE}/ai/config/${encodeURIComponent(feature)}/test`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`);
      return { ok: false, error: text, provider: null, model: null };
    }
    return res.json() as Promise<AiTestResult>;
  } catch (e) {
    return { ok: false, error: String(e), provider: null, model: null };
  }
}

export async function setFeatureChain(
  feature: string,
  chain: { provider: string; model: string }[],
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const res = await fetch(`${API_BASE}/ai/config/${encodeURIComponent(feature)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ chain }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`);
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function resetFeatureChain(
  feature: string,
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  try {
    const res = await fetch(`${API_BASE}/ai/config/${encodeURIComponent(feature)}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const text = await res.text().catch(() => `HTTP ${res.status}`);
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function createAiModel(data: {
  provider: string;
  model: string;
  display_name?: string;
  notes?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function updateAiModel(
  id: number,
  data: { display_name?: string | null; notes?: string | null; enabled?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function syncAiModels(): Promise<{
  ok: boolean;
  total_added?: number;
  added?: Record<string, number>;
  errors?: string[];
  error?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models/sync`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true, ...(await res.json()) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function fetchAiModelRankings(): Promise<{
  ok: boolean;
  sources?: string[];
  updated_elo?: number;
  updated_benchmark?: number;
  reordered_features?: string[];
  fetched_rows?: Record<string, number>;
  errors?: string[];
  error?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models/fetch-rankings`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true, ...(await res.json()) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function bulkToggleModels(params: {
  enabled: boolean;
  tier: "free" | "paid" | "all";
  provider?: string;
}): Promise<{ ok: boolean; updated?: number; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models/bulk-toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ enabled: params.enabled, tier: params.tier, provider: params.provider }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true, ...(await res.json()) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteAiModel(id: number): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  try {
    const res = await fetch(`${API_BASE}/ai/models/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, error: json.detail ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
