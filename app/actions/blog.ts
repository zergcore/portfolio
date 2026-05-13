"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

export async function createBlogPostAction(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/blog`, {
    method: "POST",
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to create post: ${errorText}` };
  }
  
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true, data: await res.json() };
}

export async function updateBlogPostAction(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/blog/${id}`, {
    method: "PATCH",
    headers: await getAuthHeader(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to update post: ${errorText}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true, data: await res.json() };
}

export async function deleteBlogPostAction(id: string) {
  const res = await fetch(`${API_BASE_URL}/blog/${id}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { error: `Failed to delete post: ${errorText}` };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}
