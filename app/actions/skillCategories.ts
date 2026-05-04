"use server";

import { cookies } from "next/headers";
import { SkillCategoryCreate, SkillCategoryUpdate } from "@/lib/api";

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

export async function createSkillCategoryAction(data: SkillCategoryCreate) {
  try {
    const res = await fetch(`${API_BASE_URL}/skill-categories`, {
      method: "POST",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return { success: true, data: await res.json() };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSkillCategoryAction(
  id: string,
  data: SkillCategoryUpdate,
) {
  try {
    const res = await fetch(`${API_BASE_URL}/skill-categories/${id}`, {
      method: "PATCH",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return { success: true, data: await res.json() };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteSkillCategoryAction(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/skill-categories/${id}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}
