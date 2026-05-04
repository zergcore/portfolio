"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ProjectCreate, ProjectUpdate } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function createProjectAction(data: ProjectCreate) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to create project: ${errorText}` };
  }
  
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true, data: await res.json() };
}

export async function updateProjectAction(id: string, data: ProjectUpdate) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to update project: ${errorText}` };
  }

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true, data: await res.json() };
}

export async function deleteProjectAction(id: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to delete project: ${errorText}` };
  }

  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  return { success: true };
}
