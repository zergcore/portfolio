"use server";

import { cookies } from "next/headers";
import { EducationCreate, EducationUpdate, ApiEducation } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export type ServerActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createEducationAction(data: EducationCreate): Promise<ServerActionResponse<ApiEducation>> {
  try {
    const res = await fetch(`${API_BASE_URL}/education`, {
      method: "POST",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create education entry");
    const result = await res.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateEducationAction(id: string, data: EducationUpdate): Promise<ServerActionResponse<ApiEducation>> {
  try {
    const res = await fetch(`${API_BASE_URL}/education/${id}`, {
      method: "PATCH",
      headers: await getAuthHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update education entry");
    const result = await res.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function deleteEducationAction(id: string): Promise<ServerActionResponse<void>> {
  try {
    const res = await fetch(`${API_BASE_URL}/education/${id}`, {
      method: "DELETE",
      headers: await getAuthHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete education entry");
    return { success: true, data: undefined as void };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
