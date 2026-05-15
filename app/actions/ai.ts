"use server";

import { cookies } from "next/headers";
import type { AiUsageData } from "@/lib/types/ai";

export type { AiUsageData } from "@/lib/types/ai";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

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
